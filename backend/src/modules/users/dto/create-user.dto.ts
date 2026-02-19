import { IsEmail, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty()
  @IsString()
  firstName: string;

  @ApiProperty()
  @IsString()
  lastName: string;

  @ApiPropertyOptional({ enum: ['admin', 'manager', 'promoter', 'organizer'] })
  @IsOptional()
  @IsEnum(['admin', 'manager', 'promoter', 'organizer'])
  role?: 'admin' | 'manager' | 'promoter' | 'organizer';
}
