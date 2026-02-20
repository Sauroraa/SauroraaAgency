import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { Booking } from './entities/booking.entity';
import { BookingComment } from './entities/booking-comment.entity';
import { BookingStatusHistory } from './entities/booking-status-history.entity';
import { BookingsService } from './bookings.service';
import { BookingsController, PublicBookingsController } from './bookings.controller';
import { ArtistsModule } from '@/modules/artists/artists.module';
import { User } from '@/modules/users/entities/user.entity';
import { PresskitsModule } from '@/modules/presskits/presskits.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking, BookingComment, BookingStatusHistory, User]),
    JwtModule.register({}),
    ArtistsModule,
    PresskitsModule,
  ],
  controllers: [BookingsController, PublicBookingsController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}
