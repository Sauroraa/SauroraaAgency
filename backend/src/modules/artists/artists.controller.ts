import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ArtistsService } from './artists.service';
import { CreateArtistDto } from './dto/create-artist.dto';
import { FilterArtistsDto } from './dto/filter-artists.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';

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
  @Roles('admin', 'manager')
  findAll(@Query() filters: FilterArtistsDto) {
    return this.artistsService.findAll(filters);
  }

  @Get(':id')
  @Roles('admin', 'manager')
  findOne(@Param('id') id: string) {
    return this.artistsService.findById(id);
  }

  @Post()
  @Roles('admin')
  create(@Body() dto: CreateArtistDto) {
    return this.artistsService.create(dto);
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
