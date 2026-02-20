import { IsString, IsOptional, IsEnum, IsNumber, IsBoolean, IsArray, IsEmail } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class CreateArtistMediaDto {
  @ApiProperty({ enum: ['image', 'video', 'audio'] })
  @IsEnum(['image', 'video', 'audio'])
  type: 'image' | 'video' | 'audio';

  @ApiProperty()
  @IsString()
  url: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

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
  @IsString()
  metaTitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  metaDescription?: string;

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

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  profileImageUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  coverImageUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  accountEmail?: string;

  @ApiPropertyOptional({ enum: ['fr', 'en', 'nl'] })
  @IsOptional()
  @IsEnum(['fr', 'en', 'nl'])
  accountLanguage?: 'fr' | 'en' | 'nl';

  @ApiPropertyOptional({ type: [CreateArtistMediaDto] })
  @IsOptional()
  @IsArray()
  media?: CreateArtistMediaDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  technicalRider?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  hospitalityRider?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  stagePlotUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  inputListUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  presskitTitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  presskitTemplate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  presskitSections?: any[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  createPresskit?: boolean;

  @ApiPropertyOptional({ type: [Number] })
  @IsOptional()
  @IsArray()
  genreIds?: number[];
}
