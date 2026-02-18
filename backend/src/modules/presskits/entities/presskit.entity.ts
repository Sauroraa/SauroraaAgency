import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';
import { Artist } from '@/modules/artists/entities/artist.entity';
import { User } from '@/modules/users/entities/user.entity';
import { PresskitLink } from './presskit-link.entity';

@Entity('presskits')
export class Presskit extends BaseEntity {
  @Column({ name: 'artist_id' })
  artistId: string;

  @Column({ name: 'created_by' })
  createdById: string;

  @Column({ length: 200 })
  title: string;

  @Column({ length: 50, default: 'default' })
  template: string;

  @Column({ type: 'json' })
  sections: any;

  @Column({ name: 'is_event_ready', default: false })
  isEventReady: boolean;

  @Column({ name: 'event_name', nullable: true, length: 200 })
  eventName: string | null;

  @Column({ name: 'event_date', type: 'date', nullable: true })
  eventDate: Date | null;

  @Column({ name: 'event_venue', nullable: true, length: 200 })
  eventVenue: string | null;

  @Column({ name: 'event_city', nullable: true, length: 100 })
  eventCity: string | null;

  @Column({ name: 'event_promoter', nullable: true, length: 200 })
  eventPromoter: string | null;

  @Column({ type: 'enum', enum: ['draft', 'active', 'expired', 'revoked'], default: 'draft' })
  status: 'draft' | 'active' | 'expired' | 'revoked';

  @ManyToOne(() => Artist, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'artist_id' })
  artist: Artist;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @OneToMany(() => PresskitLink, (link) => link.presskit)
  links: PresskitLink[];
}
