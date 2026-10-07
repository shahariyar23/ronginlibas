import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Gender } from '@prisma/client';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';

const toStringArray = ({ value }: { value: unknown }) =>
  value === undefined
    ? undefined
    : (Array.isArray(value) ? value : [value]).map(String);

const toBoolean = ({ value }: { value: unknown }) =>
  value === undefined ? undefined : value === true || value === 'true';

export class ProductQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Category slug or name' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ enum: ['Active', 'Low Stock', 'Out of Stock', 'All'] })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ enum: Gender })
  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @ApiPropertyOptional({ type: [String] })
  @Transform(toStringArray)
  @IsString({ each: true })
  @IsOptional()
  size?: string[];

  @ApiPropertyOptional({ type: [String] })
  @Transform(toStringArray)
  @IsString({ each: true })
  @IsOptional()
  color?: string[];

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  fabric?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  fit?: string;

  @ApiPropertyOptional({ minimum: 0 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  minPrice?: number;

  @ApiPropertyOptional({ minimum: 0 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  maxPrice?: number;

  @ApiPropertyOptional()
  @Transform(toBoolean)
  @IsBoolean()
  @IsOptional()
  inStock?: boolean;

  @ApiPropertyOptional()
  @Transform(toBoolean)
  @IsBoolean()
  @IsOptional()
  featured?: boolean;

  @ApiPropertyOptional()
  @Transform(toBoolean)
  @IsBoolean()
  @IsOptional()
  newArrival?: boolean;

  @ApiPropertyOptional()
  @Transform(toBoolean)
  @IsBoolean()
  @IsOptional()
  bestSeller?: boolean;

  @ApiPropertyOptional()
  @Transform(toBoolean)
  @IsBoolean()
  @IsOptional()
  expressAvailable?: boolean;

  @ApiPropertyOptional({
    enum: ['featured', 'newest', 'price-asc', 'price-desc', 'best-selling'],
    default: 'newest',
  })
  @IsString()
  @IsOptional()
  sort?: 'featured' | 'newest' | 'price-asc' | 'price-desc' | 'best-selling';
}
