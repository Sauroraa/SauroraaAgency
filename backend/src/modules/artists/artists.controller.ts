import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ArtistsService } from './artists.service';
import { CreateArtistDto } from './dto/create-artist.dto';
import { FilterArtistsDto } from './dto/filter-artists.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

// Public endpoints
@ApiTags('Artists (Public)')
@Controller('public/artists')
export class PublicArtistsController {
  constructor(private readonly artistsService: ArtistsService) {}

  @Get()
  findAll(@Query() filters: FilterArtistsDto) {
    return this.artistsService.findAllPublic(filters);
  }

  @Get('curated')
  findCurated() {
    return this.artistsService.findCurated();
  }

  @Get('genres')
  getGenres() {
    return this.artistsService.getAllGenres();
  }

  @Get('stats')
  getStats() {
    return this.artistsService.getPublicStats();
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.artistsService.findBySlug(slug);
  }
}

// Protected endpoints
@ApiTags('Artists (Admin)')
@ApiBearerAuth()
@Controller('artists')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ArtistsController {
  constructor(private readonly artistsService: ArtistsService) {}

  @Get()
  @Roles('admin', 'manager', 'organizer', 'artist')
  async findAll(@Query() filters: FilterArtistsDto, @CurrentUser() user: any) {
    if (user.role === 'organizer') {
      return this.artistsService.findAllForOrganizer(filters, user.id);
    }
    if (user.role === 'artist') {
      if (!user.linkedArtistId) {
        return { items: [], total: 0, page: 1, limit: 20, totalPages: 0 };
      }
      const artist = await this.artistsService.findById(user.linkedArtistId);
      return { items: [artist], total: 1, page: 1, limit: 20, totalPages: 1 };
    }
    return this.artistsService.findAll(filters);
  }

  @Get(':id')
  @Roles('admin', 'manager', 'organizer', 'artist')
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    if (user.role === 'artist' && user.linkedArtistId !== id) {
      throw new ForbiddenException('You can only access your artist profile');
    }
    if (user.role === 'organizer') {
      const allowed = await this.artistsService.canOrganizerAccessArtist(user.id, id);
      if (!allowed) {
        throw new ForbiddenException('You can only access artists linked to your active contracts');
      }
    }
    return this.artistsService.findById(id);
  }

  @Post()
  @Roles('admin')
  create(@Body() dto: CreateArtistDto, @CurrentUser() user: any) {
    const inviterName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Sauroraa Admin';
    return this.artistsService.create(dto, user.id, inviterName);
  }

  @Patch(':id')
  @Roles('admin')
  update(@Param('id') id: string, @Body() dto: Partial<CreateArtistDto>) {
    return this.artistsService.update(id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  delete(@Param('id') id: string) {
    return this.artistsService.delete(id);
  }

  @Patch(':id/confidential')
  @Roles('admin')
  toggleConfidential(@Param('id') id: string) {
    return this.artistsService.toggleConfidential(id);
  }

  @Get(':id/similar')
  @Roles('admin', 'manager')
  findSimilar(@Param('id') id: string) {
    return this.artistsService.findSimilar(id);
  }
}
