import { IsString, IsOptional, IsEnum, IsNumber, IsBoolean, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateArtistDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  realName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bioShort?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bioFull?: string;

  @ApiProperty()
  @IsString()
  country: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ enum: ['available', 'limited', 'unavailable'] })
  @IsOptional()
  @IsEnum(['available', 'limited', 'unavailable'])
  availability?: 'available' | 'limited' | 'unavailable';

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  popularityScore?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  spotifyUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  soundcloudUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  instagramUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  facebookUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  websiteUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  monthlyListeners?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  baseFeeMin?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  baseFeeMax?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  managerId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isConfidential?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isCurated?: boolean;

  @ApiPropertyOptional({ type: [Number] })
  @IsOptional()
  @IsArray()
  genreIds?: number[];
}
