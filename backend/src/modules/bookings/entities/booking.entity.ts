import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';
import { Artist } from '@/modules/artists/entities/artist.entity';
import { User } from '@/modules/users/entities/user.entity';
import { BookingComment } from './booking-comment.entity';
import { BookingStatusHistory } from './booking-status-history.entity';

@Entity('bookings')
export class Booking extends BaseEntity {
  @Column({ name: 'reference_code', unique: true, length: 20 })
  referenceCode: string;

  @Column({ name: 'artist_id' })
  artistId: string;

  @Column({
    type: 'enum',
    enum: ['new', 'reviewing', 'scored', 'quoted', 'negotiating', 'confirmed', 'declined', 'cancelled'],
    default: 'new',
  })
  status: string;

  @Column({ type: 'int', nullable: true })
  score: number | null;

  @Column({ name: 'score_breakdown', type: 'json', nullable: true })
  scoreBreakdown: any;

  @Column({ name: 'requester_name', length: 200 })
  requesterName: string;

  @Column({ name: 'requester_email' })
  requesterEmail: string;

  @Column({ type: 'varchar', name: 'requester_phone', nullable: true, length: 50 })
  requesterPhone: string | null;

  @Column({ type: 'varchar', name: 'requester_company', nullable: true, length: 200 })
  requesterCompany: string | null;

  @Column({ name: 'event_name', length: 200 })
  eventName: string;

  @Column({ name: 'event_date', type: 'date' })
  eventDate: Date;

  @Column({ name: 'event_date_flexible', default: false })
  eventDateFlexible: boolean;

  @Column({ type: 'varchar', name: 'event_venue', nullable: true, length: 200 })
  eventVenue: string | null;

  @Column({ name: 'event_city', length: 100 })
  eventCity: string;

  @Column({ name: 'event_country', length: 3 })
  eventCountry: string;

  @Column({ name: 'event_type', type: 'enum', enum: ['festival', 'club', 'private', 'corporate', 'other'] })
  eventType: string;

  @Column({ type: 'int', name: 'expected_attendance', nullable: true })
  expectedAttendance: number | null;

  @Column({ name: 'budget_min', type: 'decimal', precision: 10, scale: 2, nullable: true })
  budgetMin: number | null;

  @Column({ name: 'budget_max', type: 'decimal', precision: 10, scale: 2, nullable: true })
  budgetMax: number | null;

  @Column({ name: 'budget_currency', length: 3, default: 'EUR' })
  budgetCurrency: string;

  @Column({ type: 'text', nullable: true })
  message: string | null;

  @Column({ name: 'technical_requirements', type: 'text', nullable: true })
  technicalRequirements: string | null;

  @Column({ name: 'accommodation_needed', default: false })
  accommodationNeeded: boolean;

  @Column({ name: 'travel_needed', default: false })
  travelNeeded: boolean;

  @Column({ name: 'quoted_amount', type: 'decimal', precision: 10, scale: 2, nullable: true })
  quotedAmount: number | null;

  @Column({ type: 'varchar', name: 'quote_pdf_url', nullable: true, length: 500 })
  quotePdfUrl: string | null;

  @Column({ type: 'datetime', name: 'quote_sent_at', nullable: true })
  quoteSentAt: Date | null;

  @Column({ name: 'digital_signature', type: 'text', nullable: true })
  digitalSignature: string | null;

  @Column({ type: 'datetime', name: 'signed_at', nullable: true })
  signedAt: Date | null;

  @Column({ type: 'char', name: 'assigned_to', nullable: true, length: 36 })
  assignedTo: string | null;

  @Column({ type: 'varchar', name: 'source_ip', nullable: true, length: 45 })
  sourceIp: string | null;

  @Column({ type: 'varchar', name: 'source_country', nullable: true, length: 3 })
  sourceCountry: string | null;

  @ManyToOne(() => Artist)
  @JoinColumn({ name: 'artist_id' })
  artist: Artist;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assigned_to' })
  assignee: User;

  @OneToMany(() => BookingComment, (c) => c.booking)
  comments: BookingComment[];

  @OneToMany(() => BookingStatusHistory, (h) => h.booking)
  statusHistory: BookingStatusHistory[];
}
