import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from './entities/booking.entity';
import { BookingComment } from './entities/booking-comment.entity';
import { BookingStatusHistory } from './entities/booking-status-history.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { calculateBookingScore } from '@/common/utils/scoring.util';
import { ArtistsService } from '@/modules/artists/artists.service';
import { NotificationsService } from '@/modules/notifications/notifications.service';
import * as ExcelJS from 'exceljs';

@Injectable()
export class BookingsService {
  private bookingCounter = 0;

  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,
    @InjectRepository(BookingComment)
    private readonly commentRepo: Repository<BookingComment>,
    @InjectRepository(BookingStatusHistory)
    private readonly historyRepo: Repository<BookingStatusHistory>,
    private readonly artistsService: ArtistsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  private async generateReferenceCode(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.bookingRepo.count();
    return `SAU-${year}-${String(count + 1).padStart(4, '0')}`;
  }

  async submitPublic(dto: CreateBookingDto, ip: string): Promise<Booking> {
    const artist = await this.artistsService.findById(dto.artistId);

    const daysUntil = Math.floor((new Date(dto.eventDate).getTime() - Date.now()) / 86400000);
    const fields = [dto.requesterName, dto.requesterEmail, dto.eventName, dto.eventDate, dto.eventCity, dto.eventCountry, dto.eventType];
    const optionalFields = [dto.requesterPhone, dto.requesterCompany, dto.eventVenue, dto.expectedAttendance, dto.budgetMin, dto.message, dto.technicalRequirements];
    const filledOptional = optionalFields.filter(Boolean).length;
    const formCompleteness = (fields.length + filledOptional) / (fields.length + optionalFields.length);

    const scoreResult = calculateBookingScore({
      budgetMin: dto.budgetMin,
      budgetMax: dto.budgetMax,
      artistFeeMin: artist.baseFeeMin ? Number(artist.baseFeeMin) : undefined,
      artistFeeMax: artist.baseFeeMax ? Number(artist.baseFeeMax) : undefined,
      eventType: dto.eventType,
      daysUntilEvent: daysUntil,
      expectedAttendance: dto.expectedAttendance,
      formCompleteness,
    });

    const referenceCode = await this.generateReferenceCode();

    const booking = this.bookingRepo.create({
      ...dto,
      referenceCode,
      score: scoreResult.total,
      scoreBreakdown: scoreResult,
      status: 'new',
      sourceIp: ip,
      assignedTo: artist.managerId,
    });

    const saved = await this.bookingRepo.save(booking);

    await this.historyRepo.save(this.historyRepo.create({
      bookingId: saved.id,
      fromStatus: null,
      toStatus: 'new',
      note: 'Booking request submitted',
    }));

    await this.notificationsService.notifyBookingReceived(saved);

    return saved;
  }

  async findAll(page = 1, limit = 20, status?: string) {
    const where: any = {};
    if (status) where.status = status;

    const [items, total] = await this.bookingRepo.findAndCount({
      where,
      relations: ['artist', 'assignee'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string): Promise<Booking> {
    const booking = await this.bookingRepo.findOne({
      where: { id },
      relations: ['artist', 'assignee', 'comments', 'comments.user', 'statusHistory', 'statusHistory.changedByUser'],
    });
    if (!booking) throw new NotFoundException('Booking not found');
    return booking;
  }

  async updateStatus(id: string, status: string, userId: string, note?: string): Promise<Booking> {
    const booking = await this.findById(id);
    const fromStatus = booking.status;
    booking.status = status;
    const saved = await this.bookingRepo.save(booking);

    await this.historyRepo.save(this.historyRepo.create({
      bookingId: id,
      fromStatus,
      toStatus: status,
      changedBy: userId,
      note: note || null,
    }));

    await this.notificationsService.notifyBookingStatusUpdate(saved, status);

    return saved;
  }

  async addComment(bookingId: string, userId: string, content: string, isInternal = true): Promise<BookingComment> {
    const comment = this.commentRepo.create({ bookingId, userId, content, isInternal });
    return this.commentRepo.save(comment);
  }

  async assignTo(id: string, userId: string): Promise<Booking> {
    const booking = await this.findById(id);
    booking.assignedTo = userId;
    return this.bookingRepo.save(booking);
  }

  async exportToExcel(status?: string): Promise<Buffer> {
    const where: any = {};
    if (status) where.status = status;
    const bookings = await this.bookingRepo.find({
      where,
      relations: ['artist', 'assignee'],
      order: { createdAt: 'DESC' },
      take: 5000,
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Bookings');
    sheet.columns = [
      { header: 'Reference', key: 'referenceCode', width: 18 },
      { header: 'Status', key: 'status', width: 14 },
      { header: 'Artist', key: 'artist', width: 24 },
      { header: 'Event', key: 'eventName', width: 28 },
      { header: 'Event Date', key: 'eventDate', width: 14 },
      { header: 'Country', key: 'eventCountry', width: 10 },
      { header: 'Requester', key: 'requesterName', width: 22 },
      { header: 'Email', key: 'requesterEmail', width: 28 },
      { header: 'Budget Min', key: 'budgetMin', width: 12 },
      { header: 'Budget Max', key: 'budgetMax', width: 12 },
      { header: 'Score', key: 'score', width: 10 },
      { header: 'Created At', key: 'createdAt', width: 22 },
    ];

    for (const booking of bookings) {
      sheet.addRow({
        referenceCode: booking.referenceCode,
        status: booking.status,
        artist: booking.artist?.name || '',
        eventName: booking.eventName,
        eventDate: booking.eventDate ? new Date(booking.eventDate).toISOString().slice(0, 10) : '',
        eventCountry: booking.eventCountry,
        requesterName: booking.requesterName,
        requesterEmail: booking.requesterEmail,
        budgetMin: booking.budgetMin || '',
        budgetMax: booking.budgetMax || '',
        score: booking.score || '',
        createdAt: booking.createdAt ? new Date(booking.createdAt).toISOString() : '',
      });
    }

    return Buffer.from(await workbook.xlsx.writeBuffer());
  }
}
