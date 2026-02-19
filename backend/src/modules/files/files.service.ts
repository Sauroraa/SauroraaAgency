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
    const rawEndpoint = String(config.get('MINIO_ENDPOINT', 'minio')).trim();
    const rawPort = String(config.get('MINIO_PORT', '9000')).trim();
    let endPoint = rawEndpoint;
    let port = Number.parseInt(rawPort, 10);
    let useSSL = String(config.get('MINIO_USE_SSL', 'false')).toLowerCase() === 'true';

    if (rawEndpoint.startsWith('http://') || rawEndpoint.startsWith('https://')) {
      const parsed = new URL(rawEndpoint);
      endPoint = parsed.hostname;
      if (!Number.isFinite(port)) {
        port = parsed.port ? Number.parseInt(parsed.port, 10) : (parsed.protocol === 'https:' ? 443 : 80);
      }
      useSSL = parsed.protocol === 'https:';
    } else if (rawEndpoint.includes(':')) {
      const [host, endpointPort] = rawEndpoint.split(':');
      endPoint = host;
      if (!Number.isFinite(port) && endpointPort) {
        port = Number.parseInt(endpointPort, 10);
      }
    }

    if (!Number.isFinite(port)) {
      port = 9000;
    }

    this.minioClient = new Minio.Client({
      endPoint,
      port,
      useSSL,
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

  async getFileStream(fileId: string): Promise<{ stream: NodeJS.ReadableStream; mimeType: string; originalName: string }> {
    const file = await this.fileRepo.findOneByOrFail({ id: fileId });
    const stream = await this.minioClient.getObject(file.bucket, file.objectKey);
    return {
      stream,
      mimeType: file.mimeType,
      originalName: file.originalName,
    };
  }
}
