import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import PDFDocument from 'pdfkit';
import { Presskit } from './entities/presskit.entity';
import { PresskitLink } from './entities/presskit-link.entity';
import { PresskitAccessLog } from './entities/presskit-access-log.entity';
import { CreatePresskitDto, GenerateLinkDto } from './dto/create-presskit.dto';
import { NotificationsService } from '@/modules/notifications/notifications.service';
import { Booking } from '@/modules/bookings/entities/booking.entity';

@Injectable()
export class PresskitsService {
  constructor(
    @InjectRepository(Presskit)
    private readonly presskitRepo: Repository<Presskit>,
    @InjectRepository(PresskitLink)
    private readonly linkRepo: Repository<PresskitLink>,
    @InjectRepository(PresskitAccessLog)
    private readonly logRepo: Repository<PresskitAccessLog>,
    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,
    private jwtService: JwtService,
    private config: ConfigService,
    private notificationsService: NotificationsService,
  ) {}

  private async getValidatedLinkByToken(token: string, enforceViewLimit = false) {
    let payload: any;
    try {
      payload = this.jwtService.verify(token, {
        secret: this.config.get('JWT_PRESSKIT_SECRET'),
      });
    } catch {
      throw new ForbiddenException('Invalid or expired presskit link');
    }

    if (payload?.type !== 'presskit_access') {
      throw new ForbiddenException('Invalid presskit token');
    }

    const link = await this.linkRepo.findOne({
      where: { token },
      relations: ['presskit', 'presskit.artist', 'presskit.artist.manager'],
    });

    if (!link || link.isRevoked) {
      throw new ForbiddenException('Presskit link is revoked');
    }

    if (link.expiresAt && link.expiresAt < new Date()) {
      throw new ForbiddenException('Presskit link has expired');
    }

    if (enforceViewLimit && link.maxViews && link.currentViews >= link.maxViews) {
      throw new ForbiddenException('Maximum views reached');
    }

    return link;
  }

  async findAll(page = 1, limit = 20, artistId?: string, artistIds?: string[]) {
    if (Array.isArray(artistIds) && !artistIds.length) {
      return { items: [], total: 0, page, limit, totalPages: 0 };
    }

    const where = artistId
      ? { artistId }
      : Array.isArray(artistIds)
        ? { artistId: In(artistIds) }
        : {};

    const [items, total] = await this.presskitRepo.findAndCount({
      where,
      relations: ['artist', 'createdBy'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getOrganizerAccessibleArtistIds(organizerEmail: string): Promise<string[]> {
    const rows = await this.bookingRepo
      .createQueryBuilder('booking')
      .select('DISTINCT booking.artistId', 'artistId')
      .where('LOWER(booking.requesterEmail) = LOWER(:organizerEmail)', { organizerEmail })
      .andWhere('booking.status IN (:...statuses)', { statuses: ['quoted', 'negotiating', 'confirmed'] })
      .getRawMany<{ artistId: string }>();

    return rows.map((row) => row.artistId).filter(Boolean);
  }

  async findById(id: string): Promise<Presskit> {
    const pk = await this.presskitRepo.findOne({
      where: { id },
      relations: ['artist', 'createdBy', 'links'],
    });
    if (!pk) throw new NotFoundException('Presskit not found');
    return pk;
  }

  async create(dto: CreatePresskitDto, userId: string): Promise<Presskit> {
    const presskit = this.presskitRepo.create({
      ...dto,
      createdById: userId,
      status: 'draft',
    });
    return this.presskitRepo.save(presskit);
  }

  async update(id: string, dto: Partial<CreatePresskitDto>): Promise<Presskit> {
    const pk = await this.findById(id);
    Object.assign(pk, dto);
    return this.presskitRepo.save(pk);
  }

  async delete(id: string): Promise<void> {
    const pk = await this.findById(id);
    await this.presskitRepo.remove(pk);
  }

  async generateLink(id: string, dto: GenerateLinkDto): Promise<{ link: PresskitLink; url: string }> {
    const pk = await this.findById(id);
    pk.status = 'active';
    await this.presskitRepo.save(pk);

    const expiresAt = dto.expiresInHours
      ? new Date(Date.now() + dto.expiresInHours * 3600000)
      : null;

    const tokenPayload = { presskitId: id, type: 'presskit_access' };
    const token = this.jwtService.sign(tokenPayload, {
      secret: this.config.get('JWT_PRESSKIT_SECRET'),
      expiresIn: dto.expiresInHours ? `${dto.expiresInHours}h` : '30d',
    });

    const link = this.linkRepo.create({
      presskitId: id,
      token,
      recipientEmail: dto.recipientEmail || null,
      recipientName: dto.recipientName || null,
      expiresAt,
      maxViews: dto.maxViews || null,
      allowDownload: dto.allowDownload !== false,
      watermarkText: dto.watermarkText || null,
    });

    const saved = await this.linkRepo.save(link);
    const appUrl = this.config.get('APP_URL', 'http://localhost:3000');
    const url = `${appUrl}/presskit/${token}`;

    return { link: saved, url };
  }

  async viewByToken(token: string, ip: string, userAgent: string) {
    const link = await this.getValidatedLinkByToken(token, true);

    link.currentViews += 1;
    await this.linkRepo.save(link);

    const log = this.logRepo.create({
      presskitLinkId: link.id,
      ipAddress: ip,
      userAgent,
      action: 'view',
    });
    await this.logRepo.save(log);

    const managerEmail = link.presskit?.artist?.manager?.email;
    if (managerEmail) {
      await this.notificationsService.notifyPresskitViewed(managerEmail, link.presskit.artist.name, {
        ip,
        userAgent,
        viewedAt: new Date().toISOString(),
      });
    }

    return {
      presskit: link.presskit,
      artist: link.presskit.artist,
      allowDownload: link.allowDownload,
      watermarkText: link.watermarkText,
    };
  }

  async trackEvent(token: string, action: 'view' | 'download' | 'section_view', ip: string, sectionId?: string, duration?: number) {
    const link = await this.getValidatedLinkByToken(token, false);

    const log = this.logRepo.create({
      presskitLinkId: link.id,
      ipAddress: ip,
      action,
      sectionId: sectionId || null,
      durationSeconds: duration || null,
    });
    await this.logRepo.save(log);
  }

  async downloadByToken(token: string, ip: string) {
    const link = await this.getValidatedLinkByToken(token, false);
    if (!link.allowDownload) {
      throw new ForbiddenException('Download is disabled for this link');
    }

    const presskit = link.presskit;
    const artist = presskit.artist;
    const sections = Array.isArray(presskit.sections) ? presskit.sections : [];

    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    const done = new Promise<Buffer>((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
    });

    doc.fontSize(22).text(presskit.title || `Presskit - ${artist.name}`);
    doc.moveDown(0.5);
    doc.fontSize(14).fillColor('#333').text(`Artist: ${artist.name}`);
    if (presskit.isEventReady && presskit.eventName) {
      doc.text(`Event: ${presskit.eventName}`);
    }
    doc.moveDown();

    const bio = artist.bioFull || artist.bioShort || '';
    if (bio) {
      doc.fontSize(12).fillColor('#000').text('Biography', { underline: true });
      doc.moveDown(0.3);
      doc.fontSize(11).fillColor('#333').text(bio, { align: 'left' });
      doc.moveDown();
    }

    for (const section of sections) {
      if (section?.visible === false) continue;
      doc.fontSize(12).fillColor('#000').text(section?.title || 'Section', { underline: true });
      doc.moveDown(0.2);
      if (section?.content) {
        doc.fontSize(11).fillColor('#333').text(String(section.content));
      } else {
        doc.fontSize(10).fillColor('#777').text('No content provided.');
      }
      doc.moveDown();
    }

    if (link.watermarkText) {
      doc.moveDown();
      doc.fontSize(9).fillColor('#777').text(`Watermark: ${link.watermarkText}`);
    }

    doc.end();
    const buffer = await done;

    await this.trackEvent(token, 'download', ip);

    const managerEmail = presskit?.artist?.manager?.email;
    if (managerEmail) {
      await this.notificationsService.notifyPresskitDownloaded(managerEmail, artist.name, {
        ip,
        downloadedAt: new Date().toISOString(),
      });
    }

    return {
      buffer,
      fileName: `${artist.slug || artist.name.toLowerCase().replace(/\s+/g, '-')}-presskit.pdf`,
    };
  }

  async revokeLink(presskitId: string, linkId: string): Promise<void> {
    await this.linkRepo.update({ id: linkId, presskitId }, { isRevoked: true });
  }

  async getAnalytics(presskitId: string) {
    const logs = await this.logRepo.createQueryBuilder('log')
      .innerJoin('log.link', 'link')
      .where('link.presskitId = :presskitId', { presskitId })
      .getMany();

    const views = logs.filter((l) => l.action === 'view').length;
    const downloads = logs.filter((l) => l.action === 'download').length;
    const avgDuration = logs
      .filter((l) => l.durationSeconds)
      .reduce((sum, l) => sum + (l.durationSeconds || 0), 0) / (logs.filter((l) => l.durationSeconds).length || 1);

    return { views, downloads, avgDuration: Math.round(avgDuration), totalEvents: logs.length };
  }
}
