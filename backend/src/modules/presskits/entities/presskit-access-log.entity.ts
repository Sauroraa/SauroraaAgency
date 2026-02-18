import { Entity, Column, ManyToOne, JoinColumn, PrimaryColumn, CreateDateColumn, BeforeInsert } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { PresskitLink } from './presskit-link.entity';

@Entity('presskit_access_logs')
export class PresskitAccessLog {
  @PrimaryColumn('char', { length: 36 })
  id: string;

  @Column({ name: 'presskit_link_id' })
  presskitLinkId: string;

  @Column({ name: 'ip_address', length: 45 })
  ipAddress: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent: string | null;

  @Column({ type: 'enum', enum: ['view', 'download', 'section_view'] })
  action: 'view' | 'download' | 'section_view';

  @Column({ name: 'section_id', nullable: true, length: 100 })
  sectionId: string | null;

  @Column({ name: 'duration_seconds', nullable: true })
  durationSeconds: number | null;

  @Column({ nullable: true, length: 3 })
  country: string | null;

  @Column({ nullable: true, length: 100 })
  city: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => PresskitLink, (link) => link.accessLogs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'presskit_link_id' })
  link: PresskitLink;

  @BeforeInsert()
  generateId() {
    if (!this.id) this.id = uuidv4();
  }
}
