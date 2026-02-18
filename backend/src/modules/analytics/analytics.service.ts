import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { AnalyticsEvent } from './entities/analytics-event.entity';
import { Booking } from '@/modules/bookings/entities/booking.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(AnalyticsEvent)
    private readonly eventRepo: Repository<AnalyticsEvent>,
    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,
  ) {}

  async track(data: Partial<AnalyticsEvent>): Promise<void> {
    const event = this.eventRepo.create(data);
    await this.eventRepo.save(event);
  }

  async getOverview() {
    const totalBookings = await this.bookingRepo.count();
    const confirmedBookings = await this.bookingRepo.count({ where: { status: 'confirmed' } });
    const newBookings = await this.bookingRepo.count({ where: { status: 'new' } });

    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);
    const recentBookings = await this.bookingRepo.count({
      where: { createdAt: Between(thirtyDaysAgo, new Date()) as any },
    });

    const conversionRate = totalBookings > 0 ? (confirmedBookings / totalBookings) * 100 : 0;

    const avgBudgetResult = await this.bookingRepo
      .createQueryBuilder('b')
      .select('AVG(b.budget_max)', 'avg')
      .where('b.budget_max IS NOT NULL')
      .getRawOne();

    return {
      totalBookings,
      confirmedBookings,
      newBookings,
      recentBookings,
      conversionRate: Math.round(conversionRate * 10) / 10,
      avgBudget: Math.round(avgBudgetResult?.avg || 0),
    };
  }

  async getBookingsByArtist() {
    return this.bookingRepo
      .createQueryBuilder('b')
      .select('b.artist_id', 'artistId')
      .addSelect('a.name', 'artistName')
      .addSelect('COUNT(*)', 'count')
      .innerJoin('artists', 'a', 'a.id = b.artist_id')
      .groupBy('b.artist_id')
      .addGroupBy('a.name')
      .orderBy('count', 'DESC')
      .limit(20)
      .getRawMany();
  }

  async getBookingsByCountry() {
    return this.bookingRepo
      .createQueryBuilder('b')
      .select('b.event_country', 'country')
      .addSelect('COUNT(*)', 'count')
      .groupBy('b.event_country')
      .orderBy('count', 'DESC')
      .getRawMany();
  }

  async getBookingsByMonth() {
    return this.bookingRepo
      .createQueryBuilder('b')
      .select("DATE_FORMAT(b.created_at, '%Y-%m')", 'month')
      .addSelect('COUNT(*)', 'count')
      .groupBy('month')
      .orderBy('month', 'ASC')
      .getRawMany();
  }

  async getPresskitAnalytics() {
    return this.eventRepo
      .createQueryBuilder('e')
      .select('e.entity_id', 'presskitId')
      .addSelect('e.event_type', 'eventType')
      .addSelect('COUNT(*)', 'count')
      .where("e.entity_type = 'presskit'")
      .groupBy('e.entity_id')
      .addGroupBy('e.event_type')
      .getRawMany();
  }
}
