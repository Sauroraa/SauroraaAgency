import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { hashPassword } from '@/common/utils/hash.util';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async findAll(page = 1, limit = 20) {
    const [items, total] = await this.userRepo.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { email } });
  }

  async create(dto: CreateUserDto): Promise<User> {
    const existing = await this.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email already in use');

    const user = this.userRepo.create({
      email: dto.email,
      passwordHash: await hashPassword(dto.password),
      firstName: dto.firstName,
      lastName: dto.lastName,
      role: dto.role || 'manager',
    });
    return this.userRepo.save(user);
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);
    Object.assign(user, dto);
    return this.userRepo.save(user);
  }

  async deactivate(id: string): Promise<User> {
    const user = await this.findById(id);
    user.isActive = false;
    return this.userRepo.save(user);
  }

  async updateRefreshToken(id: string, hash: string | null): Promise<void> {
    await this.userRepo.update(id, { refreshTokenHash: hash });
  }

  async updateLastLogin(id: string, ip: string): Promise<void> {
    await this.userRepo.update(id, { lastLoginAt: new Date(), lastLoginIp: ip });
  }

  async findByPasswordResetToken(token: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { passwordResetToken: token } });
  }

  async setPasswordResetToken(id: string, token: string | null, expiresAt: Date | null): Promise<void> {
    await this.userRepo.update(id, {
      passwordResetToken: token,
      passwordResetExpires: expiresAt,
    });
  }

  async updatePassword(id: string, password: string): Promise<void> {
    await this.userRepo.update(id, {
      passwordHash: await hashPassword(password),
      passwordResetToken: null,
      passwordResetExpires: null,
    });
  }
}
