import { Controller, Get, Post, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { InvitationsService } from './invitations.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@ApiTags('Invitations')
@Controller('invitations')
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Get('verify/:token')
  verify(@Param('token') token: string) {
    return this.invitationsService.verify(token);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  findAll() {
    return this.invitationsService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  create(
    @Body() body: {
      email: string;
      role: 'admin' | 'manager' | 'promoter' | 'organizer' | 'artist';
      language?: 'fr' | 'en' | 'nl';
      linkedArtistId?: string;
      linkedPresskitId?: string;
    },
    @CurrentUser() user: any,
  ) {
    return this.invitationsService.create(body.email, body.role, user.id, `${user.firstName} ${user.lastName}`, {
      language: body.language || 'fr',
      linkedArtistId: body.linkedArtistId || null,
      linkedPresskitId: body.linkedPresskitId || null,
    });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  revoke(@Param('id') id: string) {
    return this.invitationsService.revoke(id);
  }
}
