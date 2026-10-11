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
    : (Array.isArray(value) ? value : [value])
        .flatMap((item) => String(item).split(','))
        .map((item) => item.trim())
        .filter(Boolean);

const toBoolean = ({ value }: { value: unknown }) =>
  value === undefined || value === true || value === false
    ? value
    : value === 'true'
      ? true
      : value === 'false'
        ? false
        : value;

export class ProductQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Category slug or name' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ description: 'Collection slug or name' })
  @IsString()
  @IsOptional()
  collection?: string;

  @ApiPropertyOptional({ enum: ['Active', 'Low Stock', 'Out of Stock', 'Archived', 'All'] })
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

  @ApiPropertyOptional({ type: [String] })
  @Transform(toStringArray)
  @IsString({ each: true })
  @IsOptional()
  fabric?: string[];

  @ApiPropertyOptional({ type: [String] })
  @Transform(toStringArray)
  @IsString({ each: true })
  @IsOptional()
  fabricOrigin?: string[];

  @ApiPropertyOptional({ type: [String] })
  @Transform(toStringArray)
  @IsString({ each: true })
  @IsOptional()
  fit?: string[];

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
  onSale?: boolean;

  @ApiPropertyOptional()
  @Transform(toBoolean)
  @IsBoolean()
  @IsOptional()
  expressAvailable?: boolean;

  @ApiPropertyOptional({
    enum: [
      'featured',
      'newest',
      'price-asc',
      'price-desc',
      'price-low',
      'price-high',
      'best-selling',
    ],
    default: 'newest',
  })
  @IsEnum([
    'featured',
    'newest',
    'price-asc',
    'price-desc',
    'price-low',
    'price-high',
    'best-selling',
  ])
  @IsOptional()
  sort?:
    | 'featured'
    | 'newest'
    | 'price-asc'
    | 'price-desc'
    | 'price-low'
    | 'price-high'
    | 'best-selling';
}
