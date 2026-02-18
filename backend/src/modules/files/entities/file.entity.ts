import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';
import { User } from '@/modules/users/entities/user.entity';

@Entity('files')
export class FileEntity extends BaseEntity {
  @Column({ name: 'original_name', length: 500 })
  originalName: string;

  @Column({ name: 'mime_type', length: 100 })
  mimeType: string;

  @Column({ name: 'size_bytes', type: 'bigint' })
  sizeBytes: number;

  @Column({ length: 100 })
  bucket: string;

  @Column({ name: 'object_key', length: 500 })
  objectKey: string;

  @Column({ type: 'char', name: 'uploaded_by', nullable: true, length: 36 })
  uploadedBy: string | null;

  @Column({ type: 'varchar', name: 'entity_type', nullable: true, length: 50 })
  entityType: string | null;

  @Column({ type: 'char', name: 'entity_id', nullable: true, length: 36 })
  entityId: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'uploaded_by' })
  uploader: User;
}
