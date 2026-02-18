import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin@sauroraa.be' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Admin@2026!' })
  @IsString()
  @MinLength(8)
  password: string;
}
