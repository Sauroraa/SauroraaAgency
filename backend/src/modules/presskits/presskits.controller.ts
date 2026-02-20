import { Controller, Get, Post, Patch, Delete, Param, Body, Query, Req, UseGuards, StreamableFile, Header, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { PresskitsService } from './presskits.service';
import { CreatePresskitDto, GenerateLinkDto } from './dto/create-presskit.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { Roles } from '@/common/decorators/roles.decorator';

// Public endpoints (token-gated)
@ApiTags('Presskits (Public)')
@Controller('public/presskits')
export class PublicPresskitsController {
  constructor(private readonly presskitsService: PresskitsService) {}

  @Get(':token')
  async view(@Param('token') token: string, @Req() req: Request) {
    const ip = req.ip || req.socket.remoteAddress || '0.0.0.0';
    const userAgent = req.headers['user-agent'] || '';
    return this.presskitsService.viewByToken(token, ip, userAgent);
  }

  @Get(':token/download')
  @Header('Content-Type', 'application/pdf')
  async download(@Param('token') token: string, @Req() req: Request) {
    const ip = req.ip || req.socket.remoteAddress || '0.0.0.0';
    const { buffer, fileName } = await this.presskitsService.downloadByToken(token, ip);
    return new StreamableFile(buffer, {
      disposition: `attachment; filename="${fileName}"`,
    });
  }

  @Post(':token/track')
  async track(
    @Param('token') token: string,
    @Body() body: { action: 'view' | 'download' | 'section_view'; sectionId?: string; duration?: number },
    @Req() req: Request,
  ) {
    const ip = req.ip || req.socket.remoteAddress || '0.0.0.0';
    await this.presskitsService.trackEvent(token, body.action, ip, body.sectionId, body.duration);
    return { success: true };
  }
}

// Protected endpoints
@ApiTags('Presskits')
@ApiBearerAuth()
@Controller('presskits')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PresskitsController {
  constructor(private readonly presskitsService: PresskitsService) {}

  @Get()
  @Roles('admin', 'manager', 'artist')
  async findAll(@Query() pagination: PaginationDto, @Query('artistId') artistId?: string, @CurrentUser() user?: any) {
    const scopedArtistId = user?.role === 'artist' ? user?.linkedArtistId : artistId;
    return this.presskitsService.findAll(pagination.page, pagination.limit, scopedArtistId);
  }

  @Get(':id')
  @Roles('admin', 'manager', 'artist')
  async findOne(@Param('id') id: string, @CurrentUser() user?: any) {
    const presskit = await this.presskitsService.findById(id);
    if (user?.role === 'artist') {
      const allowedByPresskit = user?.linkedPresskitId && user.linkedPresskitId === id;
      const allowedByArtist = user?.linkedArtistId && presskit.artistId === user.linkedArtistId;
      if (!allowedByPresskit && !allowedByArtist) {
        throw new ForbiddenException('You can only access your own presskit');
      }
    }
    return presskit;
  }

  @Post()
  @Roles('admin', 'manager')
  create(@Body() dto: CreatePresskitDto, @CurrentUser('id') userId: string) {
    return this.presskitsService.create(dto, userId);
  }

  @Patch(':id')
  @Roles('admin', 'manager')
  update(@Param('id') id: string, @Body() dto: Partial<CreatePresskitDto>) {
    return this.presskitsService.update(id, dto);
  }

  @Delete(':id')
  @Roles('admin', 'manager')
  delete(@Param('id') id: string) {
    return this.presskitsService.delete(id);
  }

  @Post(':id/generate-link')
  @Roles('admin', 'manager')
  generateLink(@Param('id') id: string, @Body() dto: GenerateLinkDto) {
    return this.presskitsService.generateLink(id, dto);
  }

  @Patch(':id/links/:linkId/revoke')
  @Roles('admin', 'manager')
  revokeLink(@Param('id') id: string, @Param('linkId') linkId: string) {
    return this.presskitsService.revokeLink(id, linkId);
  }

  @Get(':id/analytics')
  @Roles('admin', 'manager', 'artist')
  async getAnalytics(@Param('id') id: string, @CurrentUser() user?: any) {
    if (user?.role === 'artist') {
      const presskit = await this.presskitsService.findById(id);
      const allowedByPresskit = user?.linkedPresskitId && user.linkedPresskitId === id;
      const allowedByArtist = user?.linkedArtistId && presskit.artistId === user.linkedArtistId;
      if (!allowedByPresskit && !allowedByArtist) {
        throw new ForbiddenException('You can only access your own presskit analytics');
      }
    }
    return this.presskitsService.getAnalytics(id);
  }
}
