import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import { authenticator } from 'otplib';
import { UsersService } from '@/modules/users/users.service';
import { comparePassword, hashPassword } from '@/common/utils/hash.util';
import { InvitationsService } from '@/modules/invitations/invitations.service';
import { NotificationsService } from '@/modules/notifications/notifications.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ChangePasswordDto, UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private config: ConfigService,
    private invitationsService: InvitationsService,
    private notificationsService: NotificationsService,
  ) {}

  private serializeUser(user: any) {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      avatarUrl: user.avatarUrl,
    };
  }

  async login(dto: LoginDto, ip: string) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await comparePassword(dto.password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.twoFactorEnabled) {
      return { requires2FA: true, userId: user.id };
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    const refreshHash = await hashPassword(tokens.refreshToken);
    await this.usersService.updateRefreshToken(user.id, refreshHash);
    await this.usersService.updateLastLogin(user.id, ip);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: this.serializeUser(user),
    };
  }

  async register(dto: RegisterDto, ip: string) {
    const invitation = await this.invitationsService.verify(dto.invitationToken);
    if (invitation.email.toLowerCase() !== dto.email.toLowerCase()) {
      throw new BadRequestException('Invitation email does not match');
    }

    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) throw new BadRequestException('Email already in use');

    const user = await this.usersService.create({
      email: dto.email,
      password: dto.password,
      firstName: dto.firstName,
      lastName: dto.lastName,
      role: invitation.role,
    });

    await this.invitationsService.markAccepted(dto.invitationToken);

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    const refreshHash = await hashPassword(tokens.refreshToken);
    await this.usersService.updateRefreshToken(user.id, refreshHash);
    await this.usersService.updateLastLogin(user.id, ip);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: this.serializeUser(user),
    };
  }

  async verify2FA(userId: string, code: string, ip: string) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.isActive) throw new UnauthorizedException('Invalid user');
    if (!user.twoFactorEnabled || !user.twoFactorSecret) throw new UnauthorizedException('2FA is not enabled');

    const valid = authenticator.verify({ token: code, secret: user.twoFactorSecret });
    if (!valid) throw new UnauthorizedException('Invalid code');

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    const refreshHash = await hashPassword(tokens.refreshToken);
    await this.usersService.updateRefreshToken(user.id, refreshHash);
    await this.usersService.updateLastLogin(user.id, ip);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: this.serializeUser(user),
    };
  }

  async refresh(userId: string, refreshToken: string) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException('Access denied');
    }

    const isValid = await comparePassword(refreshToken, user.refreshTokenHash);
    if (!isValid) {
      throw new UnauthorizedException('Access denied');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    const refreshHash = await hashPassword(tokens.refreshToken);
    await this.usersService.updateRefreshToken(user.id, refreshHash);

    return tokens;
  }

  async logout(userId: string) {
    await this.usersService.updateRefreshToken(userId, null);
  }

  async getProfile(userId: string) {
    const user = await this.usersService.findById(userId);
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      avatarUrl: user.avatarUrl,
      twoFactorEnabled: user.twoFactorEnabled,
      lastLoginAt: user.lastLoginAt,
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.usersService.findById(userId);
    if (dto.firstName !== undefined) user.firstName = dto.firstName.trim();
    if (dto.lastName !== undefined) user.lastName = dto.lastName.trim();
    if (dto.avatarUrl !== undefined) user.avatarUrl = dto.avatarUrl.trim() || null;

    const updated = await this.usersService.update(userId, {
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.avatarUrl,
    });

    return this.serializeUser(updated);
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.usersService.findById(userId);
    const valid = await comparePassword(dto.currentPassword, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Current password is invalid');
    }
    if (dto.currentPassword === dto.newPassword) {
      throw new BadRequestException('New password must be different');
    }

    await this.usersService.updatePassword(userId, dto.newPassword);
    await this.usersService.updateRefreshToken(userId, null);

    return { message: 'Password updated successfully' };
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) return;

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await this.usersService.setPasswordResetToken(user.id, token, expiresAt);
    await this.notificationsService.sendPasswordReset(user.email, token);
  }

  async resetPassword(token: string, password: string) {
    const user = await this.usersService.findByPasswordResetToken(token);
    if (!user || !user.passwordResetExpires || user.passwordResetExpires < new Date()) {
      throw new BadRequestException('Reset token is invalid or expired');
    }

    await this.usersService.updatePassword(user.id, password);
    await this.usersService.updateRefreshToken(user.id, null);
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.config.get('JWT_ACCESS_SECRET'),
        expiresIn: this.config.get('JWT_ACCESS_EXPIRY', '15m'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.config.get('JWT_REFRESH_SECRET'),
        expiresIn: this.config.get('JWT_REFRESH_EXPIRY', '7d'),
      }),
    ]);

    return { accessToken, refreshToken };
  }
}
