import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Invitation } from './entities/invitation.entity';
import { NotificationsService } from '@/modules/notifications/notifications.service';

@Injectable()
export class InvitationsService {
  constructor(
    @InjectRepository(Invitation)
    private readonly invitationRepo: Repository<Invitation>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async findAll() {
    return this.invitationRepo.find({
      relations: ['inviter'],
      order: { createdAt: 'DESC' },
    });
  }

  async create(
    email: string,
    role: 'admin' | 'manager' | 'promoter' | 'organizer' | 'artist',
    invitedBy: string,
    inviterName: string,
    options?: {
      language?: 'fr' | 'en' | 'nl';
      linkedArtistId?: string | null;
      linkedPresskitId?: string | null;
    },
  ): Promise<Invitation> {
    const existing = await this.invitationRepo.findOne({
      where: { email, acceptedAt: IsNull() },
    });
    if (existing) {
      const now = new Date();
      if (existing.expiresAt && existing.expiresAt < now) {
        await this.invitationRepo.delete(existing.id);
      } else {
        throw new BadRequestException('Pending invitation already exists for this email');
      }
    }

    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 7 * 24 * 3600000);

    const invitation = this.invitationRepo.create({
      email,
      role,
      token,
      invitedBy,
      expiresAt,
      language: options?.language || 'fr',
      linkedArtistId: options?.linkedArtistId || null,
      linkedPresskitId: options?.linkedPresskitId || null,
    });

    const saved = await this.invitationRepo.save(invitation);
    await this.notificationsService.sendInvitation(email, inviterName, token, role, {
      language: saved.language,
    });
    return saved;
  }

  async verify(token: string): Promise<Invitation> {
    const invitation = await this.invitationRepo.findOne({ where: { token } });
    if (!invitation) throw new NotFoundException('Invitation not found');
    if (invitation.acceptedAt) throw new BadRequestException('Invitation already accepted');
    if (invitation.expiresAt < new Date()) throw new BadRequestException('Invitation expired');
    return invitation;
  }

  async markAccepted(token: string): Promise<void> {
    await this.invitationRepo.update({ token }, { acceptedAt: new Date() });
  }

  async revoke(id: string): Promise<void> {
    await this.invitationRepo.delete(id);
  }
}
