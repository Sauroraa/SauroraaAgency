import { Controller, Get, Post, Patch, Delete, Param, Body, Query, Req, UseGuards, StreamableFile, Header, ForbiddenException } from '@nestjs/common';
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
  @Roles('admin', 'manager', 'promoter', 'organizer')
  create(@Body() dto: CreateBookingDto, @Req() req: Request, @CurrentUser() user?: any) {
    const ip = req.ip || req.socket.remoteAddress || '0.0.0.0';
    return this.bookingsService.submitAuthenticated(dto, ip, user);
  }

  @Get()
  @Roles('admin', 'manager', 'organizer', 'promoter', 'artist')
  findAll(@Query() pagination: PaginationDto, @Query('status') status?: string, @CurrentUser() user?: any) {
    const artistId = user?.role === 'artist' ? user?.linkedArtistId : undefined;
    const requesterEmail = user?.role === 'promoter' || user?.role === 'organizer' ? user?.email : undefined;
    return this.bookingsService.findAll(
      pagination.page,
      pagination.limit,
      status,
      artistId,
      requesterEmail,
    );
  }

  @Get('export')
  @Roles('admin', 'manager')
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
    if (user?.role === 'organizer' && booking.requesterEmail?.toLowerCase() !== user?.email?.toLowerCase()) {
      throw new ForbiddenException('You can only access your own organizer requests');
    }
    return booking;
  }

  @Patch(':id/status')
  @Roles('admin', 'manager')
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string; note?: string },
    @CurrentUser('id') userId: string,
  ) {
    return this.bookingsService.updateStatus(id, body.status, userId, body.note);
  }

  @Post(':id/comments')
  @Roles('admin', 'manager', 'organizer', 'promoter', 'artist')
  addComment(
    @Param('id') id: string,
    @Body() body: { content: string; isInternal?: boolean },
    @CurrentUser() user: any,
  ) {
    return this.bookingsService.addComment(id, user, body.content, body.isInternal);
  }

  @Patch(':id/assign')
  @Roles('admin', 'manager')
  assign(@Param('id') id: string, @Body() body: { userId: string }) {
    return this.bookingsService.assignTo(id, body.userId);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.bookingsService.deleteById(id);
  }

  @Post(':id/send-contract')
  @Roles('admin', 'manager')
  sendContract(
    @Param('id') id: string,
    @Body() body: { quotedAmount?: number; quotePdfUrl?: string; customMessage?: string; expiresInHours?: number },
    @CurrentUser('id') userId: string,
  ) {
    return this.bookingsService.sendContractForSignature(id, body, userId);
  }

  @Post(':id/review-decision')
  @Roles('admin', 'manager')
  reviewDecision(
    @Param('id') id: string,
    @Body()
    body: {
      action: 'accept' | 'changes_required';
      quotedAmount?: number;
      quotePdfUrl?: string;
      customMessage?: string;
      expiresInHours?: number;
      note?: string;
    },
    @CurrentUser('id') userId: string,
  ) {
    return this.bookingsService.reviewDecision(id, body, userId);
  }

  @Get(':id/contract-data')
  @Roles('admin', 'manager', 'organizer', 'promoter', 'artist')
  getContractData(
    @Param('id') id: string,
    @CurrentUser() user?: any,
  ) {
    return this.bookingsService.getContractData(id, user);
  }

  @Patch(':id/contract-data')
  @Roles('admin', 'manager')
  updateContractDataByAdmin(
    @Param('id') id: string,
    @Body() body: { contract: any },
    @CurrentUser('id') userId: string,
  ) {
    return this.bookingsService.updateContractDataByAdmin(id, body?.contract || {}, userId);
  }

  @Patch(':id/contract-data/organizer')
  @Roles('organizer', 'promoter')
  updateContractDataByOrganizer(
    @Param('id') id: string,
    @Body() body: { contract: any },
    @CurrentUser() user?: any,
  ) {
    return this.bookingsService.updateContractDataByOrganizer(id, body?.contract || {}, user);
  }

  @Post(':id/contract-sign')
  @Roles('organizer', 'promoter')
  signContractDirect(
    @Param('id') id: string,
    @Body() body: { signature: string },
    @CurrentUser() user?: any,
  ) {
    return this.bookingsService.signContractDirect(id, body?.signature || '', user);
  }

  @Get(':id/contract-pdf')
  @Roles('admin', 'manager', 'organizer', 'promoter', 'artist')
  @Header('Content-Type', 'application/pdf')
  async downloadContractPdf(
    @Param('id') id: string,
    @CurrentUser() user?: any,
  ) {
    const { buffer, fileName } = await this.bookingsService.generateContractPdf(id, user);
    return new StreamableFile(buffer, {
      disposition: `attachment; filename="${fileName}"`,
    });
  }

  @Get(':id/contract-link')
  @Roles('admin', 'manager', 'organizer', 'promoter')
  getContractLink(
    @Param('id') id: string,
    @CurrentUser() user?: any,
  ) {
    return this.bookingsService.getContractSigningLinkForBooking(id, user);
  }

  @Post(':id/upload-signed-contract')
  @Roles('admin', 'manager', 'organizer', 'promoter')
  uploadSignedContract(
    @Param('id') id: string,
    @Body() body: { signedContractUrl: string; note?: string },
    @CurrentUser() user?: any,
  ) {
    return this.bookingsService.submitSignedContractUpload(id, body.signedContractUrl, user, body.note);
  }

  @Get(':id/invoice')
  @Roles('admin', 'manager', 'organizer', 'promoter')
  @Header('Content-Type', 'application/pdf')
  async downloadInvoice(
    @Param('id') id: string,
    @CurrentUser() user?: any,
  ) {
    const { buffer, fileName } = await this.bookingsService.generateInvoicePdf(id, user);
    return new StreamableFile(buffer, {
      disposition: `attachment; filename="${fileName}"`,
    });
  }
}
