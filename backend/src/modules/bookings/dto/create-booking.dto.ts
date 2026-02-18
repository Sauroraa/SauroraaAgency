import { IsString, IsOptional, IsEmail, IsEnum, IsNumber, IsBoolean, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBookingDto {
  @ApiProperty()
  @IsString()
  artistId: string;

  @ApiProperty()
  @IsString()
  requesterName: string;

  @ApiProperty()
  @IsEmail()
  requesterEmail: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  requesterPhone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  requesterCompany?: string;

  @ApiProperty()
  @IsString()
  eventName: string;

  @ApiProperty()
  @IsDateString()
  eventDate: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  eventDateFlexible?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  eventVenue?: string;

  @ApiProperty()
  @IsString()
  eventCity: string;

  @ApiProperty()
  @IsString()
  eventCountry: string;

  @ApiProperty({ enum: ['festival', 'club', 'private', 'corporate', 'other'] })
  @IsEnum(['festival', 'club', 'private', 'corporate', 'other'])
  eventType: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  expectedAttendance?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  budgetMin?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  budgetMax?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  budgetCurrency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  message?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  technicalRequirements?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  accommodationNeeded?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  travelNeeded?: boolean;
}
