import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsNumber,
  IsOptional,
  IsDateString,
  IsBoolean,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCouponDto {
  @ApiProperty({ example: 'EID2026' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiPropertyOptional({ example: 'Eid-ul-Fitr Grand Atelier Festival' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: ['PERCENTAGE', 'FIXED'], default: 'PERCENTAGE' })
  @IsEnum(['PERCENTAGE', 'FIXED'])
  type: 'PERCENTAGE' | 'FIXED';

  @ApiProperty({ example: 15 })
  @IsNumber()
  @Min(0)
  value: number;

  @ApiPropertyOptional({ example: 5000 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  minimumOrderAmount?: number = 0;

  @ApiPropertyOptional({ example: 1000 })
  @IsNumber()
  @IsOptional()
  maximumDiscount?: number;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({ example: '2026-12-31T23:59:59.000Z' })
  @IsDateString()
  @IsNotEmpty()
  expiryDate: string;

  @ApiPropertyOptional({ example: 500 })
  @IsNumber()
  @IsOptional()
  usageLimit?: number;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;
}
