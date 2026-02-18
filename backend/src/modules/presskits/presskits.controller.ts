import { Controller, Get, Post, Patch, Delete, Param, Body, Query, Req, UseGuards, StreamableFile, Header } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { PresskitsService } from './presskits.service';
import { CreatePresskitDto, GenerateLinkDto } from './dto/create-presskit.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { PaginationDto } from '@/common/dto/pagination.dto';

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
@UseGuards(JwtAuthGuard)
export class PresskitsController {
  constructor(private readonly presskitsService: PresskitsService) {}

  @Get()
  findAll(@Query() pagination: PaginationDto) {
    return this.presskitsService.findAll(pagination.page, pagination.limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.presskitsService.findById(id);
  }

  @Post()
  create(@Body() dto: CreatePresskitDto, @CurrentUser('id') userId: string) {
    return this.presskitsService.create(dto, userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreatePresskitDto>) {
    return this.presskitsService.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.presskitsService.delete(id);
  }

  @Post(':id/generate-link')
  generateLink(@Param('id') id: string, @Body() dto: GenerateLinkDto) {
    return this.presskitsService.generateLink(id, dto);
  }

  @Patch(':id/links/:linkId/revoke')
  revokeLink(@Param('id') id: string, @Param('linkId') linkId: string) {
    return this.presskitsService.revokeLink(id, linkId);
  }

  @Get(':id/analytics')
  getAnalytics(@Param('id') id: string) {
    return this.presskitsService.getAnalytics(id);
  }
}
