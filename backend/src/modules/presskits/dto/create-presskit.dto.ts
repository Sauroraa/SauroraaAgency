import { IsString, IsOptional, IsBoolean, IsDateString, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePresskitDto {
  @ApiProperty()
  @IsString()
  artistId: string;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  template?: string;

  @ApiProperty()
  @IsObject()
  sections: any;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isEventReady?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  eventName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  eventDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  eventVenue?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  eventCity?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  eventPromoter?: string;
}

export class GenerateLinkDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  recipientEmail?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  recipientName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  expiresInHours?: number;

  @ApiPropertyOptional()
  @IsOptional()
  maxViews?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  allowDownload?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  watermarkText?: string;
}
