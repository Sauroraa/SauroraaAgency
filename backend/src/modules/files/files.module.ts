import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileEntity } from './entities/file.entity';
import { FilesService } from './files.service';
import { FilesController, PublicFilesController } from './files.controller';

@Module({
  imports: [TypeOrmModule.forFeature([FileEntity])],
  controllers: [FilesController, PublicFilesController],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {}
