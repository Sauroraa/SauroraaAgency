import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';

@ApiTags('Analytics (Public)')
@Controller('analytics')
export class AnalyticsTrackController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('track')
  async track(@Body() body: any, @Req() req: Request) {
    await this.analyticsService.track({
      eventType: body.eventType,
      entityType: body.entityType,
      entityId: body.entityId,
      sessionId: body.sessionId,
      ipAddress: req.ip || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
      referrer: req.headers.referer || null,
      metadata: body.metadata,
    });
    return { success: true };
  }
}

@ApiTags('Analytics')
@ApiBearerAuth()
@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'manager')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overview')
  getOverview() {
    return this.analyticsService.getOverview();
  }

  @Get('bookings/by-artist')
  getBookingsByArtist() {
    return this.analyticsService.getBookingsByArtist();
  }

  @Get('bookings/by-country')
  getBookingsByCountry() {
    return this.analyticsService.getBookingsByCountry();
  }

  @Get('bookings/by-month')
  getBookingsByMonth() {
    return this.analyticsService.getBookingsByMonth();
  }

  @Get('presskits')
  getPresskitAnalytics() {
    return this.analyticsService.getPresskitAnalytics();
  }
}
