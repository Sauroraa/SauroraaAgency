import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Booking } from './entities/booking.entity';
import { BookingComment } from './entities/booking-comment.entity';
import { BookingStatusHistory } from './entities/booking-status-history.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { calculateBookingScore } from '@/common/utils/scoring.util';
import { ArtistsService } from '@/modules/artists/artists.service';
import { NotificationsService } from '@/modules/notifications/notifications.service';
import * as ExcelJS from 'exceljs';
import { User } from '@/modules/users/entities/user.entity';
import { PresskitsService } from '@/modules/presskits/presskits.service';
import PDFDocument from 'pdfkit';

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
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly artistsService: ArtistsService,
    private readonly presskitsService: PresskitsService,
    private readonly notificationsService: NotificationsService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
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

  async submitAuthenticated(dto: CreateBookingDto, ip: string, user?: any): Promise<Booking> {
    if (user?.role === 'organizer') {
      const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || dto.requesterName;
      const organizerDto: CreateBookingDto = {
        ...dto,
        requesterName: fullName,
        requesterEmail: user.email,
      };
      return this.submitPublic(organizerDto, ip);
    }
    return this.submitPublic(dto, ip);
  }

  private ensureBookingAccess(booking: Booking, user?: any) {
    if (!user) return;
    if (user.role === 'admin' || user.role === 'manager') return;
    if ((user.role === 'promoter' || user.role === 'organizer') && booking.requesterEmail?.toLowerCase() === user.email?.toLowerCase()) return;
    if (user.role === 'artist' && booking.artistId === user.linkedArtistId) return;
    throw new ForbiddenException('You can only access your own contract');
  }

  private getContractDataFromBooking(booking: Booking) {
    const breakdown = booking.scoreBreakdown && typeof booking.scoreBreakdown === 'object' ? booking.scoreBreakdown : {};
    const existingContract = breakdown.contract && typeof breakdown.contract === 'object' ? breakdown.contract : {};
    const artist = booking.artist;

    const defaults = {
      organizer: {
        companyName: booking.requesterCompany || '',
        legalForm: '',
        registeredOffice: '',
        bceNumber: '',
        vatNumber: '',
        representativeName: booking.requesterName || '',
        representativeRole: '',
      },
      artist: {
        stageName: artist?.name || '',
        legalNameOrCompany: '',
        legalForm: '',
        address: '',
        bceNumber: '',
        vatNumber: '',
        representativeName: '',
      },
      performance: {
        eventType: booking.eventType || '',
        eventDate: booking.eventDate ? new Date(booking.eventDate).toISOString().slice(0, 10) : '',
        venue: booking.eventVenue || booking.eventName || '',
        fullAddress: `${booking.eventCity || ''} ${booking.eventCountry || ''}`.trim(),
        arrivalTime: '',
        performanceTime: '',
        duration: '',
        setsCount: '',
      },
      financial: {
        feeAmount: booking.quotedAmount ? Number(booking.quotedAmount) : (booking.budgetMax ? Number(booking.budgetMax) : 0),
        feeCurrency: booking.budgetCurrency || 'EUR',
        feeVatIncluded: false,
        depositPercent: 30,
        balanceDueType: 'event_day',
        balanceDueDaysAfterInvoice: '',
        iban: '',
        bic: '',
      },
      logistics: {
        transportCoveredBy: '',
        accommodation: '',
        hospitalityRider: '',
      },
      legal: {
        exclusivityRadiusKm: '',
        exclusivityDays: '',
        placeSigned: '',
        dateSignedByOrganizer: '',
        dateSignedByArtist: '',
      },
      signatures: {
        organizerSignatureName: '',
        artistSignatureName: '',
      },
      workflow: {
        adminPrefilledAt: null,
        organizerCompletedAt: null,
      },
    };

    return {
      ...defaults,
      ...existingContract,
      organizer: { ...defaults.organizer, ...(existingContract.organizer || {}) },
      artist: { ...defaults.artist, ...(existingContract.artist || {}) },
      performance: { ...defaults.performance, ...(existingContract.performance || {}) },
      financial: { ...defaults.financial, ...(existingContract.financial || {}) },
      logistics: { ...defaults.logistics, ...(existingContract.logistics || {}) },
      legal: { ...defaults.legal, ...(existingContract.legal || {}) },
      signatures: { ...defaults.signatures, ...(existingContract.signatures || {}) },
      workflow: { ...defaults.workflow, ...(existingContract.workflow || {}) },
    };
  }

  private async saveContractData(booking: Booking, contractData: any) {
    const breakdown = booking.scoreBreakdown && typeof booking.scoreBreakdown === 'object' ? booking.scoreBreakdown : {};
    booking.scoreBreakdown = {
      ...breakdown,
      contract: contractData,
    };
    return this.bookingRepo.save(booking);
  }

  async findAll(
    page = 1,
    limit = 20,
    status?: string,
    artistId?: string,
    requesterEmail?: string,
  ) {
    const where: any = {};
    if (status) where.status = status;
    if (artistId) where.artistId = artistId;
    if (requesterEmail) where.requesterEmail = requesterEmail;

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

    await this.notificationsService.notifyBookingStatusUpdate(saved, status, note);

    return saved;
  }

  async addComment(bookingId: string, user: any, content: string, isInternal = true): Promise<BookingComment> {
    const booking = await this.findById(bookingId);
    if (user?.role === 'artist' && booking.artistId !== user?.linkedArtistId) {
      throw new ForbiddenException('You can only comment your own artist bookings');
    }
    if ((user?.role === 'promoter' || user?.role === 'organizer') && booking.requesterEmail?.toLowerCase() !== user?.email?.toLowerCase()) {
      throw new ForbiddenException('You can only comment your own booking requests');
    }

    const comment = this.commentRepo.create({ bookingId, userId: user.id, content, isInternal });
    return this.commentRepo.save(comment);
  }

  async assignTo(id: string, userId: string): Promise<Booking> {
    const booking = await this.findById(id);
    booking.assignedTo = userId;
    return this.bookingRepo.save(booking);
  }

  async deleteById(id: string): Promise<void> {
    const booking = await this.findById(id);
    await this.bookingRepo.remove(booking);
  }

  private signContractToken(bookingId: string, requesterEmail: string, expiresInHours?: number) {
    const payload = { type: 'booking_contract', bookingId, requesterEmail };
    return this.jwtService.sign(payload, {
      secret: (this.configService.get<string>('JWT_BOOKING_SIGN_SECRET') || this.configService.get<string>('JWT_ACCESS_SECRET') || 'dev-secret'),
      expiresIn: expiresInHours ? `${expiresInHours}h` : '7d',
    });
  }

  private verifyContractToken(token: string): { bookingId: string; requesterEmail: string; type: string } {
    try {
      return this.jwtService.verify(token, {
        secret: (this.configService.get<string>('JWT_BOOKING_SIGN_SECRET') || this.configService.get<string>('JWT_ACCESS_SECRET') || 'dev-secret'),
      });
    } catch {
      throw new ForbiddenException('Invalid or expired contract link');
    }
  }

  async sendContractForSignature(
    id: string,
    dto: { quotedAmount?: number; quotePdfUrl?: string; customMessage?: string; expiresInHours?: number },
    userId: string,
  ) {
    const booking = await this.findById(id);
    const previousStatus = booking.status;

    if (dto.quotedAmount !== undefined) booking.quotedAmount = dto.quotedAmount;
    if (dto.quotePdfUrl !== undefined) booking.quotePdfUrl = dto.quotePdfUrl;
    booking.quoteSentAt = new Date();
    booking.status = 'quoted';

    const saved = await this.bookingRepo.save(booking);

    if (previousStatus !== saved.status) {
      await this.historyRepo.save(this.historyRepo.create({
        bookingId: saved.id,
        fromStatus: previousStatus,
        toStatus: saved.status,
        changedBy: userId,
        note: 'Contract sent for signature',
      }));
    }

    const token = this.signContractToken(saved.id, saved.requesterEmail, dto.expiresInHours);
    const appUrl = this.configService.get('APP_URL', 'https://agency.sauroraa.be');
    const signingUrl = `${appUrl}/contract/${token}`;

    await this.notificationsService.sendContractSignatureRequest(saved, signingUrl, dto.customMessage);
    await this.notifyArtistContractConfirmation(saved);

    return { signingUrl, status: 'sent' };
  }

  private async notifyArtistContractConfirmation(booking: Booking) {
    if (!booking.artistId) return;
    const artistUser = await this.userRepo.findOne({
      where: { role: 'artist', linkedArtistId: booking.artistId, isActive: true },
    });
    if (!artistUser) return;

    const dashboardUrl = `${this.configService.get('APP_URL', 'https://agency.sauroraa.be')}/dashboard/bookings/${booking.id}`;
    await this.notificationsService.sendArtistContractConfirmationRequest(artistUser.email, booking, dashboardUrl);
  }

  async reviewDecision(
    id: string,
    dto: {
      action: 'accept' | 'changes_required';
      quotedAmount?: number;
      quotePdfUrl?: string;
      customMessage?: string;
      expiresInHours?: number;
      note?: string;
    },
    userId: string,
  ) {
    const booking = await this.findById(id);

    if (dto.action === 'changes_required') {
      if (dto.quotedAmount !== undefined) booking.quotedAmount = dto.quotedAmount;
      if (dto.quotePdfUrl !== undefined) booking.quotePdfUrl = dto.quotePdfUrl;
      const saved = await this.bookingRepo.save(booking);
      await this.updateStatus(saved.id, 'negotiating', userId, dto.note || dto.customMessage || 'Changes requested by admin');
      return { status: 'changes_required' };
    }

    return this.sendContractForSignature(
      id,
      {
        quotedAmount: dto.quotedAmount,
        quotePdfUrl: dto.quotePdfUrl,
        customMessage: dto.customMessage || dto.note,
        expiresInHours: dto.expiresInHours,
      },
      userId,
    );
  }

  async getContractByToken(token: string) {
    const payload = this.verifyContractToken(token);
    if (payload.type !== 'booking_contract') throw new ForbiddenException('Invalid contract token');

    const booking = await this.findById(payload.bookingId);
    if (booking.requesterEmail.toLowerCase() !== payload.requesterEmail.toLowerCase()) {
      throw new ForbiddenException('Contract recipient mismatch');
    }

    return {
      id: booking.id,
      referenceCode: booking.referenceCode,
      artistName: booking.artist?.name,
      eventName: booking.eventName,
      eventDate: booking.eventDate,
      eventCity: booking.eventCity,
      eventCountry: booking.eventCountry,
      quotedAmount: booking.quotedAmount,
      budgetCurrency: booking.budgetCurrency,
      quotePdfUrl: booking.quotePdfUrl,
      requesterName: booking.requesterName,
      requesterEmail: booking.requesterEmail,
      signedAt: booking.signedAt,
      alreadySigned: Boolean(booking.signedAt),
    };
  }

  async getContractData(id: string, user?: any) {
    const booking = await this.findById(id);
    this.ensureBookingAccess(booking, user);

    return {
      bookingId: booking.id,
      referenceCode: booking.referenceCode,
      status: booking.status,
      signedAt: booking.signedAt,
      contract: this.getContractDataFromBooking(booking),
      artist: booking.artist,
      requesterEmail: booking.requesterEmail,
      requesterName: booking.requesterName,
    };
  }

  async updateContractDataByAdmin(id: string, contractPatch: any, userId: string) {
    const booking = await this.findById(id);
    const contract = this.getContractDataFromBooking(booking);
    const merged = {
      ...contract,
      ...contractPatch,
      organizer: { ...contract.organizer, ...(contractPatch?.organizer || {}) },
      artist: { ...contract.artist, ...(contractPatch?.artist || {}) },
      performance: { ...contract.performance, ...(contractPatch?.performance || {}) },
      financial: { ...contract.financial, ...(contractPatch?.financial || {}) },
      logistics: { ...contract.logistics, ...(contractPatch?.logistics || {}) },
      legal: { ...contract.legal, ...(contractPatch?.legal || {}) },
      signatures: { ...contract.signatures, ...(contractPatch?.signatures || {}) },
      workflow: {
        ...contract.workflow,
        ...(contractPatch?.workflow || {}),
        adminPrefilledAt: new Date().toISOString(),
      },
      updatedByAdminId: userId,
      updatedAt: new Date().toISOString(),
    };
    await this.saveContractData(booking, merged);
    return { success: true };
  }

  async updateContractDataByOrganizer(id: string, contractPatch: any, user: any) {
    const booking = await this.findById(id);
    this.ensureBookingAccess(booking, user);

    const contract = this.getContractDataFromBooking(booking);
    const merged = {
      ...contract,
      ...contractPatch,
      organizer: { ...contract.organizer, ...(contractPatch?.organizer || {}) },
      performance: { ...contract.performance, ...(contractPatch?.performance || {}) },
      logistics: { ...contract.logistics, ...(contractPatch?.logistics || {}) },
      legal: { ...contract.legal, ...(contractPatch?.legal || {}) },
      signatures: { ...contract.signatures, ...(contractPatch?.signatures || {}) },
      workflow: {
        ...contract.workflow,
        ...(contractPatch?.workflow || {}),
        organizerCompletedAt: new Date().toISOString(),
      },
      updatedByOrganizerEmail: user?.email || null,
      updatedAt: new Date().toISOString(),
    };
    await this.saveContractData(booking, merged);
    return { success: true };
  }

  async signContractDirect(id: string, signature: string, user: any) {
    const booking = await this.findById(id);
    this.ensureBookingAccess(booking, user);
    if (!signature?.trim()) throw new BadRequestException('Signature is required');
    if (booking.signedAt) throw new BadRequestException('Contract already signed');

    const contract = this.getContractDataFromBooking(booking);
    const contractWithSignature = {
      ...contract,
      signatures: {
        ...contract.signatures,
        organizerSignatureName: signature.trim(),
      },
      legal: {
        ...contract.legal,
        dateSignedByOrganizer: new Date().toISOString().slice(0, 10),
      },
      workflow: {
        ...contract.workflow,
        organizerCompletedAt: new Date().toISOString(),
      },
    };
    await this.saveContractData(booking, contractWithSignature);

    const previousStatus = booking.status;
    booking.digitalSignature = signature.trim();
    booking.signedAt = new Date();
    booking.status = 'confirmed';
    const saved = await this.bookingRepo.save(booking);

    await this.historyRepo.save(this.historyRepo.create({
      bookingId: saved.id,
      fromStatus: previousStatus,
      toStatus: 'confirmed',
      changedBy: user?.id || null,
      note: 'Contract signed from organizer dashboard',
    }));

    await this.notificationsService.sendContractSignedConfirmation(saved);
    await this.sendPresskitAccessAfterSignature(saved);
    return { success: true, referenceCode: saved.referenceCode };
  }

  async signContractByToken(token: string, signature: string) {
    const payload = this.verifyContractToken(token);
    if (payload.type !== 'booking_contract') throw new ForbiddenException('Invalid contract token');
    if (!signature?.trim()) throw new BadRequestException('Signature is required');

    const booking = await this.findById(payload.bookingId);
    if (booking.requesterEmail.toLowerCase() !== payload.requesterEmail.toLowerCase()) {
      throw new ForbiddenException('Contract recipient mismatch');
    }
    if (booking.signedAt) {
      throw new BadRequestException('Contract already signed');
    }

    const previousStatus = booking.status;
    booking.digitalSignature = signature.trim();
    booking.signedAt = new Date();
    booking.status = 'confirmed';
    const saved = await this.bookingRepo.save(booking);

    await this.historyRepo.save(this.historyRepo.create({
      bookingId: saved.id,
      fromStatus: previousStatus,
      toStatus: 'confirmed',
      note: 'Contract signed online',
    }));

    await this.notificationsService.sendContractSignedConfirmation(saved);
    await this.sendPresskitAccessAfterSignature(saved);

    return { success: true, referenceCode: saved.referenceCode };
  }

  private async sendPresskitAccessAfterSignature(booking: Booking): Promise<void> {
    if (!booking.artistId) return;

    const result = await this.presskitsService.findAll(1, 1, booking.artistId);
    const presskit = result.items?.[0];
    if (!presskit) return;

    const generated = await this.presskitsService.generateLink(presskit.id, {
      recipientEmail: booking.requesterEmail,
      recipientName: booking.requesterName,
      allowDownload: true,
      expiresInHours: 14 * 24,
      maxViews: 100,
      watermarkText: `Booking ${booking.referenceCode} - ${booking.requesterName}`,
    });

    await this.notificationsService.sendPresskitAccessAfterContractSigned(
      booking.requesterEmail,
      {
        referenceCode: booking.referenceCode,
        artistName: booking.artist?.name || '',
        eventName: booking.eventName,
        requesterName: booking.requesterName,
      },
      generated.url,
      generated.link.expiresAt || null,
    );
  }

  async getContractSigningLinkForBooking(id: string, user?: any) {
    const booking = await this.findById(id);
    if ((user?.role === 'promoter' || user?.role === 'organizer') && booking.requesterEmail?.toLowerCase() !== user?.email?.toLowerCase()) {
      throw new ForbiddenException('You can only access your own contract links');
    }

    const token = this.signContractToken(booking.id, booking.requesterEmail, 24);
    const appUrl = this.configService.get('APP_URL', 'https://agency.sauroraa.be');
    const signingUrl = `${appUrl}/contract/${token}`;
    return {
      signingUrl,
      expiresInHours: 24,
      alreadySigned: Boolean(booking.signedAt),
    };
  }

  async submitSignedContractUpload(id: string, signedContractUrl: string, user: any, note?: string) {
    const booking = await this.findById(id);
    if (!signedContractUrl?.trim()) {
      throw new BadRequestException('Signed contract URL is required');
    }
    if ((user?.role === 'promoter' || user?.role === 'organizer') && booking.requesterEmail?.toLowerCase() !== user?.email?.toLowerCase()) {
      throw new ForbiddenException('You can only upload signed files for your own contracts');
    }

    const previousStatus = booking.status;
    const previousBreakdown = booking.scoreBreakdown && typeof booking.scoreBreakdown === 'object' ? booking.scoreBreakdown : {};
    booking.scoreBreakdown = {
      ...previousBreakdown,
      contractUpload: {
        url: signedContractUrl.trim(),
        uploadedAt: new Date().toISOString(),
        uploadedBy: user?.email || null,
        note: note || null,
      },
    };

    if (!booking.signedAt) {
      booking.signedAt = new Date();
    }
    booking.digitalSignature = booking.digitalSignature || `uploaded_file:${signedContractUrl.trim()}`;
    booking.status = 'confirmed';

    const saved = await this.bookingRepo.save(booking);

    await this.historyRepo.save(this.historyRepo.create({
      bookingId: saved.id,
      fromStatus: previousStatus,
      toStatus: saved.status,
      changedBy: user?.id || null,
      note: note || 'Signed contract file uploaded by organizer',
    }));

    await this.notificationsService.sendContractSignedConfirmation(saved);
    await this.sendPresskitAccessAfterSignature(saved);

    return { success: true, referenceCode: saved.referenceCode };
  }

  async generateInvoicePdf(id: string, user?: any): Promise<{ buffer: Buffer; fileName: string }> {
    const booking = await this.findById(id);
    if ((user?.role === 'promoter' || user?.role === 'organizer') && booking.requesterEmail?.toLowerCase() !== user?.email?.toLowerCase()) {
      throw new ForbiddenException('You can only access your own invoices');
    }
    if (!booking.signedAt || booking.status !== 'confirmed') {
      throw new BadRequestException('Invoice is available only for confirmed signed contracts');
    }

    const companyName = this.configService.get('INVOICE_COMPANY_NAME', 'SAURORAA');
    const companyAddress = this.configService.get('INVOICE_COMPANY_ADDRESS', 'Belgium');
    const companyVat = this.configService.get('INVOICE_COMPANY_VAT', 'N/A');
    const companyIban = this.configService.get('INVOICE_COMPANY_IBAN', 'N/A');
    const amount = booking.quotedAmount ? Number(booking.quotedAmount) : 0;
    const vatRate = Number(this.configService.get('INVOICE_VAT_RATE', 21));
    const vatAmount = Number(((amount * vatRate) / 100).toFixed(2));
    const total = Number((amount + vatAmount).toFixed(2));

    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    const done = new Promise<Buffer>((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
    });

    doc.fontSize(22).text('Invoice');
    doc.moveDown(0.5);
    doc.fontSize(11).text(`${companyName}`);
    doc.text(`${companyAddress}`);
    doc.text(`VAT: ${companyVat}`);
    doc.text(`IBAN: ${companyIban}`);
    doc.moveDown();

    doc.fontSize(12).text(`Invoice reference: INV-${booking.referenceCode}`);
    doc.text(`Booking reference: ${booking.referenceCode}`);
    doc.text(`Issued on: ${new Date().toLocaleDateString()}`);
    doc.moveDown();

    doc.text(`Client: ${booking.requesterName}`);
    doc.text(`Client email: ${booking.requesterEmail}`);
    if (booking.requesterCompany) doc.text(`Company: ${booking.requesterCompany}`);
    doc.moveDown();

    doc.text(`Artist: ${booking.artist?.name || 'N/A'}`);
    doc.text(`Event: ${booking.eventName}`);
    doc.text(`Event date: ${new Date(booking.eventDate).toLocaleDateString()}`);
    doc.moveDown();

    doc.fontSize(12).text(`Amount (excl. VAT): ${amount.toFixed(2)} ${booking.budgetCurrency}`);
    doc.text(`VAT ${vatRate}%: ${vatAmount.toFixed(2)} ${booking.budgetCurrency}`);
    doc.fontSize(14).text(`Total: ${total.toFixed(2)} ${booking.budgetCurrency}`);
    doc.moveDown();
    doc.fontSize(10).fillColor('#555').text('Payment method: bank transfer to SAURORAA account using booking reference.');
    doc.end();

    const buffer = await done;
    return {
      buffer,
      fileName: `invoice-${booking.referenceCode}.pdf`,
    };
  }

  async generateContractPdf(id: string, user?: any): Promise<{ buffer: Buffer; fileName: string }> {
    const booking = await this.findById(id);
    this.ensureBookingAccess(booking, user);
    const contract = this.getContractDataFromBooking(booking);

    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    const done = new Promise<Buffer>((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
    });

    const line = (txt = '', size = 11, gap = 6) => {
      doc.fontSize(size).fillColor('#111').text(txt);
      doc.moveDown(gap / 10);
    };

    line("CONTRAT DE BOOKING D'ARTISTE", 18, 8);
    line('(Conforme au droit belge)', 10, 8);

    line('ENTRE LES SOUSSIGNES', 12, 4);
    line(`1. L'ORGANISATEUR`, 11, 2);
    line(`Denomination : ${contract.organizer.companyName || ''}`);
    line(`Forme juridique : ${contract.organizer.legalForm || ''}`);
    line(`Siege social : ${contract.organizer.registeredOffice || ''}`);
    line(`Numero d'entreprise (BCE) : ${contract.organizer.bceNumber || ''}`);
    line(`TVA : ${contract.organizer.vatNumber || ''}`);
    line(`Represente par : ${contract.organizer.representativeName || ''}`);
    line(`Fonction : ${contract.organizer.representativeRole || ''}`, 11, 8);

    line(`2. L'ARTISTE / GROUPE / DJ`, 11, 2);
    line(`Nom artistique : ${contract.artist.stageName || booking.artist?.name || ''}`);
    line(`Nom legal / Societe : ${contract.artist.legalNameOrCompany || ''}`);
    line(`Forme juridique : ${contract.artist.legalForm || ''}`);
    line(`Adresse : ${contract.artist.address || ''}`);
    line(`Numero d'entreprise (BCE) : ${contract.artist.bceNumber || ''}`);
    line(`TVA : ${contract.artist.vatNumber || ''}`);
    line(`Represente par : ${contract.artist.representativeName || ''}`, 11, 8);

    line('ARTICLE 1 - OBJET DU CONTRAT', 12, 2);
    line("Le present contrat a pour objet l'engagement de l'Artiste par l'Organisateur pour une prestation artistique definie aux conditions ci-apres.");
    line("L'Artiste s'engage a executer personnellement la prestation convenue.", 11, 8);

    line('ARTICLE 2 - DETAILS DE LA PRESTATION', 12, 2);
    line(`Type d'evenement : ${contract.performance.eventType || ''}`);
    line(`Date : ${contract.performance.eventDate || ''}`);
    line(`Lieu : ${contract.performance.venue || ''}`);
    line(`Adresse complete : ${contract.performance.fullAddress || ''}`);
    line(`Horaire d'arrivee : ${contract.performance.arrivalTime || ''}`);
    line(`Horaire de prestation : ${contract.performance.performanceTime || ''}`);
    line(`Duree de la prestation : ${contract.performance.duration || ''}`);
    line(`Nombre de sets : ${contract.performance.setsCount || ''}`, 11, 8);

    line('ARTICLE 3 - CACHET ET CONDITIONS FINANCIERES', 12, 2);
    line(`Cachet : ${contract.financial.feeAmount || 0} ${contract.financial.feeCurrency || 'EUR'} ${contract.financial.feeVatIncluded ? 'TVA incluse' : 'HTVA'}`);
    line(`Acompte : ${contract.financial.depositPercent || 0}% a la signature`);
    line(`Solde : ${contract.financial.balanceDueType === 'event_day' ? "le jour de l'evenement" : `${contract.financial.balanceDueDaysAfterInvoice || ''} jours apres facturation`}`);
    line(`IBAN : ${contract.financial.iban || ''}`);
    line(`BIC : ${contract.financial.bic || ''}`, 11, 8);

    line('ARTICLE 4 - OBLIGATIONS DE L\'ORGANISATEUR', 12, 2);
    line('Autorisations administratives, securite, son/lumiere conformes, loges, acces scene, respect des nuisances sonores.', 11, 6);
    line('ARTICLE 5 - OBLIGATIONS DE L\'ARTISTE', 12, 2);
    line('Prestation convenue, presence, respect legal, droits necessaires.', 11, 6);
    line('ARTICLE 6 - DROITS D\'AUTEUR (SABAM & DROITS VOISINS)', 12, 2);
    line("Responsabilite Organisateur pour declarations et paiements des droits.", 11, 6);
    line('ARTICLE 7 - TRANSPORT, HEBERGEMENT & HOSPITALITE', 12, 2);
    line(`Transport pris en charge par : ${contract.logistics.transportCoveredBy || ''}`);
    line(`Hebergement : ${contract.logistics.accommodation || ''}`);
    line(`Catering / Hospitality Rider : ${contract.logistics.hospitalityRider || ''}`, 11, 8);
    line('ARTICLE 8 - ASSURANCES', 12, 2);
    line('Chaque partie declare etre couverte par une assurance RC pro valable en Belgique.', 11, 6);
    line('ARTICLE 9 - ANNULATION', 12, 2);
    line('Plus de 60 jours: acompte conserve. Entre 60 et 30 jours: 50%. Moins de 30 jours: 100%.', 11, 6);
    line('ARTICLE 10 - FORCE MAJEURE', 12, 2);
    line("Evenements imprevus/irresistibles/externes; recherche de reprogrammation.", 11, 6);
    line('ARTICLE 11 - EXCLUSIVITE', 12, 2);
    line(`Rayon: ${contract.legal.exclusivityRadiusKm || ''} km / Periode: ${contract.legal.exclusivityDays || ''} jours`, 11, 6);
    line('ARTICLE 12 - CAPTATION & IMAGE', 12, 2);
    line("Captation/diffusion sous accord ecrit; usage promo lie a l'evenement.", 11, 6);
    line('ARTICLE 13 - CONFIDENTIALITE', 12, 2);
    line('Conditions financieres strictement confidentielles.', 11, 6);
    line('ARTICLE 14 - RELATION DES PARTIES', 12, 2);
    line("Pas de lien de subordination. L'Artiste agit comme prestataire independant.", 11, 6);
    line('ARTICLE 15 - DROIT APPLICABLE ET COMPETENCE', 12, 2);
    line("Droit belge. Tribunaux de l'arrondissement du siege de l'Organisateur.", 11, 6);
    line('ARTICLE 16 - DISPOSITIONS FINALES', 12, 2);
    line('Toute modification ecrite et signee. Contrat etabli en deux exemplaires.', 11, 8);

    line(`Fait a : ${contract.legal.placeSigned || ''}`);
    line(`Le : ${contract.legal.dateSignedByOrganizer || ''}`);
    line(`Signature Organisateur : ${contract.signatures.organizerSignatureName || ''}`);
    line(`Signature Artiste : ${contract.signatures.artistSignatureName || ''}`);

    doc.end();
    const buffer = await done;
    return { buffer, fileName: `contrat-booking-${booking.referenceCode}.pdf` };
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
