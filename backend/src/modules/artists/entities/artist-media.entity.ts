import { Entity, Column, ManyToOne, JoinColumn, PrimaryColumn, CreateDateColumn, BeforeInsert } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Artist } from './artist.entity';

@Entity('artist_media')
export class ArtistMedia {
  @PrimaryColumn('char', { length: 36 })
  id: string;

  @Column({ name: 'artist_id' })
  artistId: string;

  @Column({ type: 'enum', enum: ['image', 'video', 'audio'] })
  type: 'image' | 'video' | 'audio';

  @Column({ length: 500 })
  url: string;

  @Column({ name: 'thumbnail_url', nullable: true, length: 500 })
  thumbnailUrl: string | null;

  @Column({ nullable: true, length: 200 })
  title: string | null;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Artist, (artist) => artist.media, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'artist_id' })
  artist: Artist;

  @BeforeInsert()
  generateId() {
    if (!this.id) this.id = uuidv4();
  }
}
