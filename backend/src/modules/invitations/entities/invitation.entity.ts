import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';
import { User } from '@/modules/users/entities/user.entity';

@Entity('invitations')
export class Invitation extends BaseEntity {
  @Column()
  email: string;

  @Column({ type: 'enum', enum: ['admin', 'manager', 'promoter', 'organizer', 'artist'], default: 'manager' })
  role: 'admin' | 'manager' | 'promoter' | 'organizer' | 'artist';

  @Column({ type: 'enum', enum: ['fr', 'en', 'nl'], default: 'fr' })
  language: 'fr' | 'en' | 'nl';

  @Column({ type: 'char', name: 'linked_artist_id', nullable: true, length: 36 })
  linkedArtistId: string | null;

  @Column({ type: 'char', name: 'linked_presskit_id', nullable: true, length: 36 })
  linkedPresskitId: string | null;

  @Column({ unique: true })
  token: string;

  @Column({ name: 'invited_by' })
  invitedBy: string;

  @Column({ name: 'expires_at' })
  expiresAt: Date;

  @Column({ type: 'datetime', name: 'accepted_at', nullable: true })
  acceptedAt: Date | null;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'invited_by' })
  inviter: User;
}
