import { Entity, Column, PrimaryColumn, CreateDateColumn, BeforeInsert } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryColumn('char', { length: 36 })
  id: string;

  @Column({ type: 'char', name: 'user_id', nullable: true, length: 36 })
  userId: string | null;

  @Column({ length: 100 })
  action: string;

  @Column({ name: 'entity_type', length: 50 })
  entityType: string;

  @Column({ type: 'char', name: 'entity_id', nullable: true, length: 36 })
  entityId: string | null;

  @Column({ name: 'old_values', type: 'json', nullable: true })
  oldValues: any;

  @Column({ name: 'new_values', type: 'json', nullable: true })
  newValues: any;

  @Column({ type: 'varchar', name: 'ip_address', nullable: true, length: 45 })
  ipAddress: string | null;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @BeforeInsert()
  generateId() { if (!this.id) this.id = uuidv4(); }
}
