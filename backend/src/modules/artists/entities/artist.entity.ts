import { Entity, Column, ManyToOne, ManyToMany, OneToMany, JoinColumn, JoinTable } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';
import { User } from '@/modules/users/entities/user.entity';
import { Genre } from './genre.entity';
import { ArtistMedia } from './artist-media.entity';

@Entity('artists')
export class Artist extends BaseEntity {
  @Column({ unique: true, length: 150 })
  slug: string;

  @Column({ length: 200 })
  name: string;

  @Column({ type: 'varchar', name: 'real_name', nullable: true, length: 200 })
  realName: string | null;

  @Column({ type: 'varchar', name: 'bio_short', nullable: true, length: 500 })
  bioShort: string | null;

  @Column({ name: 'bio_full', type: 'text', nullable: true })
  bioFull: string | null;

  @Column({ length: 3, default: 'BEL' })
  country: string;

  @Column({ type: 'varchar', nullable: true, length: 100 })
  city: string | null;

  @Column({ type: 'enum', enum: ['available', 'limited', 'unavailable'], default: 'available' })
  availability: 'available' | 'limited' | 'unavailable';

  @Column({ name: 'popularity_score', default: 0 })
  popularityScore: number;

  @Column({ name: 'is_confidential', default: false })
  isConfidential: boolean;

  @Column({ name: 'is_curated', default: false })
  isCurated: boolean;

  @Column({ type: 'varchar', name: 'profile_image_url', nullable: true, length: 500 })
  profileImageUrl: string | null;

  @Column({ type: 'varchar', name: 'cover_image_url', nullable: true, length: 500 })
  coverImageUrl: string | null;

  @Column({ type: 'varchar', name: 'spotify_url', nullable: true, length: 500 })
  spotifyUrl: string | null;

  @Column({ type: 'varchar', name: 'soundcloud_url', nullable: true, length: 500 })
  soundcloudUrl: string | null;

  @Column({ type: 'varchar', name: 'instagram_url', nullable: true, length: 500 })
  instagramUrl: string | null;

  @Column({ type: 'varchar', name: 'facebook_url', nullable: true, length: 500 })
  facebookUrl: string | null;

  @Column({ type: 'varchar', name: 'website_url', nullable: true, length: 500 })
  websiteUrl: string | null;

  @Column({ type: 'int', name: 'monthly_listeners', nullable: true })
  monthlyListeners: number | null;

  @Column({ name: 'base_fee_min', type: 'decimal', precision: 10, scale: 2, nullable: true })
  baseFeeMin: number | null;

  @Column({ name: 'base_fee_max', type: 'decimal', precision: 10, scale: 2, nullable: true })
  baseFeeMax: number | null;

  @Column({ type: 'char', name: 'manager_id', nullable: true, length: 36 })
  managerId: string | null;

  @Column({ type: 'varchar', name: 'meta_title', nullable: true, length: 200 })
  metaTitle: string | null;

  @Column({ type: 'varchar', name: 'meta_description', nullable: true, length: 500 })
  metaDescription: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'manager_id' })
  manager: User;

  @ManyToMany(() => Genre, { eager: true })
  @JoinTable({
    name: 'artist_genres',
    joinColumn: { name: 'artist_id' },
    inverseJoinColumn: { name: 'genre_id' },
  })
  genres: Genre[];

  @OneToMany(() => ArtistMedia, (media) => media.artist, { eager: true })
  media: ArtistMedia[];
}
