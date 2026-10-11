import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OfferType, OfferDiscountType } from '@prisma/client';

export class CreateOfferDto {
  @ApiProperty({ example: 'Eid Collection Special Markdown' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'eid-collection-special' })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiPropertyOptional({ example: 'Exclusive festive offers across handcrafted panjabis' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'Special Offers' })
  @IsString()
  @IsOptional()
  bannerTitle?: string;

  @ApiPropertyOptional({ example: 'Save more on selected Rongin Libas styles.' })
  @IsString()
  @IsOptional()
  bannerSubtitle?: string;

  @ApiPropertyOptional({ example: 'Up to 30% OFF' })
  @IsString()
  @IsOptional()
  bannerMessage?: string;

  @ApiPropertyOptional({ enum: OfferType, default: OfferType.PRODUCT_DISCOUNT })
  @IsEnum(OfferType)
  @IsOptional()
  offerType?: OfferType;

  @ApiProperty({ enum: OfferDiscountType, default: OfferDiscountType.PERCENTAGE })
  @IsEnum(OfferDiscountType)
  discountType: OfferDiscountType;

  @ApiProperty({ example: 20 })
  @IsNumber()
  @Min(0)
  discountValue: number;

  @ApiProperty({ example: '2026-10-11T00:00:00.000Z' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2026-10-31T23:59:59.999Z' })
  @IsDateString()
  expiryDate: string;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ example: 'EXCLUSIVE DEAL' })
  @IsString()
  @IsOptional()
  badgeText?: string;

  @ApiPropertyOptional({ example: 'BESPOKE1000' })
  @IsString()
  @IsOptional()
  couponCode?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsInt()
  @IsOptional()
  priority?: number;

  @ApiPropertyOptional({ type: [String], description: 'Product IDs to attach to offer' })
  @IsString({ each: true })
  @IsOptional()
  productIds?: string[];

  @ApiPropertyOptional({ type: [String], description: 'Category IDs to attach to offer' })
  @IsString({ each: true })
  @IsOptional()
  categoryIds?: string[];

  @ApiPropertyOptional({ type: [String], description: 'Collection IDs to attach to offer' })
  @IsString({ each: true })
  @IsOptional()
  collectionIds?: string[];
}
