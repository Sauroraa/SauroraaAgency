import { Entity, Column, PrimaryColumn, CreateDateColumn, BeforeInsert } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity('analytics_events')
export class AnalyticsEvent {
  @PrimaryColumn('char', { length: 36 })
  id: string;

  @Column({ name: 'event_type', length: 100 })
  eventType: string;

  @Column({ name: 'entity_type', nullable: true, length: 50 })
  entityType: string | null;

  @Column({ name: 'entity_id', nullable: true })
  entityId: string | null;

  @Column({ name: 'user_id', nullable: true })
  userId: string | null;

  @Column({ name: 'session_id', nullable: true, length: 100 })
  sessionId: string | null;

  @Column({ name: 'ip_address', nullable: true, length: 45 })
  ipAddress: string | null;

  @Column({ nullable: true, length: 3 })
  country: string | null;

  @Column({ nullable: true, length: 100 })
  city: string | null;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent: string | null;

  @Column({ nullable: true, length: 500 })
  referrer: string | null;

  @Column({ type: 'json', nullable: true })
  metadata: any;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @BeforeInsert()
  generateId() { if (!this.id) this.id = uuidv4(); }
}
