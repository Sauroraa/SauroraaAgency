import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Artist } from './entities/artist.entity';
import { Genre } from './entities/genre.entity';
import { ArtistMedia } from './entities/artist-media.entity';
import { Booking } from '@/modules/bookings/entities/booking.entity';
import { Presskit } from '@/modules/presskits/entities/presskit.entity';
import { ArtistsService } from './artists.service';
import { ArtistsController, PublicArtistsController } from './artists.controller';
import { InvitationsModule } from '@/modules/invitations/invitations.module';

@Module({
  imports: [TypeOrmModule.forFeature([Artist, Genre, ArtistMedia, Booking, Presskit]), InvitationsModule],
  controllers: [ArtistsController, PublicArtistsController],
  providers: [ArtistsService],
  exports: [ArtistsService],
})
export class ArtistsModule {}
