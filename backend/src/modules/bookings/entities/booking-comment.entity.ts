import { Entity, Column, ManyToOne, JoinColumn, PrimaryColumn, CreateDateColumn, BeforeInsert } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Booking } from './booking.entity';
import { User } from '@/modules/users/entities/user.entity';

@Entity('booking_comments')
export class BookingComment {
  @PrimaryColumn('char', { length: 36 })
  id: string;

  @Column({ name: 'booking_id' })
  bookingId: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ name: 'is_internal', default: true })
  isInternal: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Booking, (b) => b.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'booking_id' })
  booking: Booking;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @BeforeInsert()
  generateId() { if (!this.id) this.id = uuidv4(); }
}
