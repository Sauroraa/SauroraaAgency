import { Entity, Column, ManyToOne, JoinColumn, PrimaryColumn, CreateDateColumn, BeforeInsert } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Booking } from './booking.entity';
import { User } from '@/modules/users/entities/user.entity';

@Entity('booking_status_history')
export class BookingStatusHistory {
  @PrimaryColumn('char', { length: 36 })
  id: string;

  @Column({ name: 'booking_id' })
  bookingId: string;

  @Column({ name: 'from_status', nullable: true, length: 50 })
  fromStatus: string | null;

  @Column({ name: 'to_status', length: 50 })
  toStatus: string;

  @Column({ name: 'changed_by', nullable: true })
  changedBy: string | null;

  @Column({ type: 'text', nullable: true })
  note: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Booking, (b) => b.statusHistory, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'booking_id' })
  booking: Booking;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'changed_by' })
  changedByUser: User;

  @BeforeInsert()
  generateId() { if (!this.id) this.id = uuidv4(); }
}
