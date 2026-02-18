import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { v4 as uuidv4 } from 'uuid';
import { FileEntity } from './entities/file.entity';

@Injectable()
export class FilesService implements OnModuleInit {
  private minioClient: Minio.Client;
  private buckets: string[];

  constructor(
    @InjectRepository(FileEntity)
    private readonly fileRepo: Repository<FileEntity>,
    private config: ConfigService,
  ) {
    this.minioClient = new Minio.Client({
      endPoint: config.get('MINIO_ENDPOINT', 'minio'),
      port: config.get<number>('MINIO_PORT', 9000),
      useSSL: false,
      accessKey: config.get('MINIO_ACCESS_KEY', ''),
      secretKey: config.get('MINIO_SECRET_KEY', ''),
    });
    this.buckets = [
      config.get('MINIO_BUCKET_ARTISTS', 'artists'),
      config.get('MINIO_BUCKET_PRESSKITS', 'presskits'),
      config.get('MINIO_BUCKET_BOOKINGS', 'bookings'),
      config.get('MINIO_BUCKET_AVATARS', 'avatars'),
    ];
  }

  async onModuleInit() {
    for (const bucket of this.buckets) {
      const exists = await this.minioClient.bucketExists(bucket);
      if (!exists) {
        await this.minioClient.makeBucket(bucket);
      }
    }
  }

  async upload(
    file: Express.Multer.File,
    bucket: string,
    userId?: string,
    entityType?: string,
    entityId?: string,
  ): Promise<FileEntity> {
    const ext = file.originalname.split('.').pop();
    const objectKey = `${uuidv4()}.${ext}`;

    await this.minioClient.putObject(bucket, objectKey, file.buffer, file.size, {
      'Content-Type': file.mimetype,
    });

    const fileEntity = this.fileRepo.create({
      originalName: file.originalname,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      bucket,
      objectKey,
      uploadedBy: userId || null,
      entityType: entityType || null,
      entityId: entityId || null,
    });

    return this.fileRepo.save(fileEntity);
  }

  async getSignedUrl(fileId: string, expirySeconds = 3600): Promise<string> {
    const file = await this.fileRepo.findOneByOrFail({ id: fileId });
    return this.minioClient.presignedGetObject(file.bucket, file.objectKey, expirySeconds);
  }

  async getSignedUrlByKey(bucket: string, objectKey: string, expirySeconds = 3600): Promise<string> {
    return this.minioClient.presignedGetObject(bucket, objectKey, expirySeconds);
  }

  async delete(fileId: string): Promise<void> {
    const file = await this.fileRepo.findOneByOrFail({ id: fileId });
    await this.minioClient.removeObject(file.bucket, file.objectKey);
    await this.fileRepo.remove(file);
  }
}
