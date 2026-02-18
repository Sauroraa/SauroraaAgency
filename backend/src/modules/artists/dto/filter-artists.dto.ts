import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '@/common/dto/pagination.dto';

export class FilterArtistsDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  genre?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ enum: ['available', 'limited', 'unavailable'] })
  @IsOptional()
  @IsEnum(['available', 'limited', 'unavailable'])
  availability?: string;

  @ApiPropertyOptional({ enum: ['popularity', 'name', 'newest'] })
  @IsOptional()
  @IsString()
  sortBy?: 'popularity' | 'name' | 'newest';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;
}
