import { Entity, Column, OneToMany, BeforeInsert } from 'typeorm';
import { Exclude } from 'class-transformer';
import { BaseEntity } from '@/common/entities/base.entity';

@Entity('users')
export class User extends BaseEntity {
  @Column({ unique: true })
  email: string;

  @Column({ name: 'password_hash' })
  @Exclude()
  passwordHash: string;

  @Column({ name: 'first_name', length: 100 })
  firstName: string;

  @Column({ name: 'last_name', length: 100 })
  lastName: string;

  @Column({ type: 'enum', enum: ['admin', 'manager'], default: 'manager' })
  role: 'admin' | 'manager';

  @Column({ name: 'avatar_url', nullable: true, length: 500 })
  avatarUrl: string | null;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'two_factor_secret', nullable: true })
  @Exclude()
  twoFactorSecret: string | null;

  @Column({ name: 'two_factor_enabled', default: false })
  twoFactorEnabled: boolean;

  @Column({ name: 'last_login_at', nullable: true })
  lastLoginAt: Date | null;

  @Column({ name: 'last_login_ip', nullable: true, length: 45 })
  lastLoginIp: string | null;

  @Column({ name: 'refresh_token_hash', nullable: true })
  @Exclude()
  refreshTokenHash: string | null;

  @Column({ name: 'password_reset_token', nullable: true })
  @Exclude()
  passwordResetToken: string | null;

  @Column({ name: 'password_reset_expires', nullable: true })
  passwordResetExpires: Date | null;

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
