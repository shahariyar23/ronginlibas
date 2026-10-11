import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

const toStringArray = ({ value }: { value: unknown }) =>
  value === undefined
    ? undefined
    : (Array.isArray(value) ? value : [value])
        .flatMap((item) => String(item).split(','))
        .map((item) => item.trim())
        .filter(Boolean);

export class QueryOffersDto {
  @ApiPropertyOptional({ description: 'Category slug or name' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ description: 'Minimum discount percentage (e.g. 10, 20, 30)' })
  @IsString()
  @IsOptional()
  discountBand?: string;

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

  @ApiPropertyOptional({ enum: ['all', 'best-discounts', 'bundle'] })
  @IsString()
  @IsOptional()
  tab?: 'all' | 'best-discounts' | 'bundle';

  @ApiPropertyOptional({
    enum: ['featured', 'discount-high', 'price-low', 'price-high', 'newest'],
    default: 'discount-high',
  })
  @IsString()
  @IsOptional()
  sort?: 'featured' | 'discount-high' | 'price-low' | 'price-high' | 'newest';

  @ApiPropertyOptional({ minimum: 1, default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ minimum: 1, default: 24 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number = 24;
}

export class QueryAdminOffersDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ enum: ['ALL', 'ACTIVE', 'SCHEDULED', 'EXPIRED', 'INACTIVE'] })
  @IsString()
  @IsOptional()
  status?: string;
}
