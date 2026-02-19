import { Controller, Get, Post, Patch, Param, Body, Query, Req, UseGuards, StreamableFile, Header, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { Roles } from '@/common/decorators/roles.decorator';

@ApiTags('Bookings (Public)')
@Controller('public/bookings')
export class PublicBookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  async submit(@Body() dto: CreateBookingDto, @Req() req: Request) {
    const ip = req.ip || req.socket.remoteAddress || '0.0.0.0';
    return this.bookingsService.submitPublic(dto, ip);
  }

  @Get('contracts/:token')
  getContract(@Param('token') token: string) {
    return this.bookingsService.getContractByToken(token);
  }

  @Post('contracts/:token/sign')
  signContract(@Param('token') token: string, @Body() body: { signature: string }) {
    return this.bookingsService.signContractByToken(token, body.signature);
  }
}

@ApiTags('Bookings')
@ApiBearerAuth()
@Controller('bookings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  create(@Body() dto: CreateBookingDto, @Req() req: Request) {
    const ip = req.ip || req.socket.remoteAddress || '0.0.0.0';
    return this.bookingsService.submitAuthenticated(dto, ip);
  }

  @Get()
  @Roles('admin', 'manager', 'organizer', 'promoter', 'artist')
  findAll(@Query() pagination: PaginationDto, @Query('status') status?: string, @CurrentUser() user?: any) {
    const artistId = user?.role === 'artist' ? user?.linkedArtistId : undefined;
    const requesterEmail = user?.role === 'promoter' ? user?.email : undefined;
    return this.bookingsService.findAll(pagination.page, pagination.limit, status, artistId, requesterEmail);
  }

  @Get('export')
  @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  async export(@Query('status') status?: string) {
    const buffer = await this.bookingsService.exportToExcel(status);
    const timestamp = new Date().toISOString().slice(0, 10);
    return new StreamableFile(buffer, {
      disposition: `attachment; filename="bookings-${timestamp}.xlsx"`,
    });
  }

  @Get(':id')
  @Roles('admin', 'manager', 'organizer', 'promoter', 'artist')
  async findOne(@Param('id') id: string, @CurrentUser() user?: any) {
    const booking = await this.bookingsService.findById(id);
    if (user?.role === 'artist' && booking.artistId !== user?.linkedArtistId) {
      throw new ForbiddenException('You can only access your own artist bookings');
    }
    if (user?.role === 'promoter' && booking.requesterEmail?.toLowerCase() !== user?.email?.toLowerCase()) {
      throw new ForbiddenException('You can only access your own requests');
    }
    return booking;
  }

  @Patch(':id/status')
  @Roles('admin', 'manager', 'organizer')
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string; note?: string },
    @CurrentUser('id') userId: string,
  ) {
    return this.bookingsService.updateStatus(id, body.status, userId, body.note);
  }

  @Post(':id/comments')
  @Roles('admin', 'manager', 'organizer', 'artist')
  addComment(
    @Param('id') id: string,
    @Body() body: { content: string; isInternal?: boolean },
    @CurrentUser('id') userId: string,
  ) {
    return this.bookingsService.addComment(id, userId, body.content, body.isInternal);
  }

  @Patch(':id/assign')
  @Roles('admin', 'manager')
  assign(@Param('id') id: string, @Body() body: { userId: string }) {
    return this.bookingsService.assignTo(id, body.userId);
  }

  @Post(':id/send-contract')
  @Roles('admin', 'manager', 'organizer')
  sendContract(
    @Param('id') id: string,
    @Body() body: { quotedAmount?: number; quotePdfUrl?: string; customMessage?: string; expiresInHours?: number },
    @CurrentUser('id') userId: string,
  ) {
    return this.bookingsService.sendContractForSignature(id, body, userId);
  }
}
