import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { Presskit } from './entities/presskit.entity';
import { PresskitLink } from './entities/presskit-link.entity';
import { PresskitAccessLog } from './entities/presskit-access-log.entity';
import { Booking } from '@/modules/bookings/entities/booking.entity';
import { PresskitsService } from './presskits.service';
import { PresskitsController, PublicPresskitsController } from './presskits.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Presskit, PresskitLink, PresskitAccessLog]),
    TypeOrmModule.forFeature([Booking]),
    JwtModule.register({}),
  ],
  controllers: [PresskitsController, PublicPresskitsController],
  providers: [PresskitsService],
  exports: [PresskitsService],
})
export class PresskitsModule {}
