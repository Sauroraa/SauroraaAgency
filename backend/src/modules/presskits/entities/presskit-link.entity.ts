import { Entity, Column, ManyToOne, OneToMany, JoinColumn, PrimaryColumn, CreateDateColumn, BeforeInsert } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Presskit } from './presskit.entity';
import { PresskitAccessLog } from './presskit-access-log.entity';

@Entity('presskit_links')
export class PresskitLink {
  @PrimaryColumn('char', { length: 36 })
  id: string;

  @Column({ name: 'presskit_id' })
  presskitId: string;

  @Column({ length: 2000 })
  token: string;

  @Column({ type: 'varchar', name: 'recipient_email', nullable: true, length: 255 })
  recipientEmail: string | null;

  @Column({ type: 'varchar', name: 'recipient_name', nullable: true, length: 200 })
  recipientName: string | null;

  @Column({ type: 'datetime', name: 'expires_at', nullable: true })
  expiresAt: Date | null;

  @Column({ type: 'int', name: 'max_views', nullable: true })
  maxViews: number | null;

  @Column({ name: 'current_views', default: 0 })
  currentViews: number;

  @Column({ name: 'allow_download', default: true })
  allowDownload: boolean;

  @Column({ type: 'varchar', name: 'watermark_text', nullable: true, length: 200 })
  watermarkText: string | null;

  @Column({ name: 'is_revoked', default: false })
  isRevoked: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Presskit, (pk) => pk.links, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'presskit_id' })
  presskit: Presskit;

  @OneToMany(() => PresskitAccessLog, (log) => log.link)
  accessLogs: PresskitAccessLog[];

  @BeforeInsert()
  generateId() {
    if (!this.id) this.id = uuidv4();
  }
}
