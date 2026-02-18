import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsEvent } from './entities/analytics-event.entity';
import { Booking } from '@/modules/bookings/entities/booking.entity';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController, AnalyticsTrackController } from './analytics.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AnalyticsEvent, Booking])],
  controllers: [AnalyticsController, AnalyticsTrackController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
