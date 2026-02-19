import { Controller, Get, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(@Query() pagination: PaginationDto) {
    return this.usersService.findAll(pagination.page, pagination.limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  deactivate(@Param('id') id: string, @CurrentUser('id') actorId: string) {
    return this.usersService.setManagerActiveStatus(id, false, actorId);
  }

  @Patch(':id/status')
  setStatus(
    @Param('id') id: string,
    @Body() body: { isActive: boolean },
    @CurrentUser('id') actorId: string,
  ) {
    return this.usersService.setManagerActiveStatus(id, Boolean(body?.isActive), actorId);
  }

  @Delete(':id/permanent')
  deleteManager(@Param('id') id: string, @CurrentUser('id') actorId: string) {
    return this.usersService.deleteManager(id, actorId);
  }
}
