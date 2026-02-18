import { Controller, Post, Get, Delete, Param, UseGuards, UseInterceptors, UploadedFile, Query } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { FilesService } from './files.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@ApiTags('Files')
@ApiBearerAuth()
@Controller('files')
@UseGuards(JwtAuthGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 50 * 1024 * 1024 } }))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Query('bucket') bucket: string,
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
    @CurrentUser('id') userId?: string,
  ) {
    return this.filesService.upload(file, bucket || 'artists', userId, entityType, entityId);
  }

  @Get(':id/signed-url')
  async getSignedUrl(@Param('id') id: string) {
    const url = await this.filesService.getSignedUrl(id);
    return { url };
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.filesService.delete(id);
    return { message: 'File deleted' };
  }
}
