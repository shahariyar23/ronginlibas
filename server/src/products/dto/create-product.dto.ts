import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsArray,
  ValidateNested,
  IsEnum,
  Min,
  IsInt,
  MaxLength,
  IsObject,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';

export class CreateVariantDto {
  @ApiProperty({ example: 'L', description: 'Canonical size label; do not put measurements here' })
  @IsString()
  @IsNotEmpty()
  size: string;

  @ApiPropertyOptional({ example: 'L', description: 'Canonical size label shown to customers' })
  @IsString()
  @IsOptional()
  sizeLabel?: string;

  @ApiPropertyOptional({ enum: ['APPAREL', 'WAIST', 'CUSTOM'], example: 'APPAREL' })
  @IsIn(['APPAREL', 'WAIST', 'CUSTOM'])
  @IsOptional()
  sizeType?: 'APPAREL' | 'WAIST' | 'CUSTOM';

  @ApiProperty({ example: 'Heritage Olive' })
  @IsString()
  @IsNotEmpty()
  color: string;

  @ApiProperty({ example: 'RL-PNJ-25-OG-M' })
  @IsString()
  @IsNotEmpty()
  sku: string;

  @ApiProperty({ example: 12 })
  @IsNumber()
  @Min(0)
  stock: number;

  @ApiPropertyOptional({ example: 3450 })
  @IsNumber()
  @IsOptional()
  priceOverride?: number;

  @ApiPropertyOptional({
    description: 'Optional size-specific measurements, e.g. { chest: 40, unit: "IN" }',
  })
  @IsObject()
  @IsOptional()
  measurements?: Prisma.InputJsonObject;
}

export class CreateProductImageDto {
  @ApiProperty({ example: 'https://images.example.com/panjabi-1.jpg' })
  @IsString()
  @IsNotEmpty()
  url: string;

  @ApiPropertyOptional({ example: 'rongin-libas/products/garment-front' })
  @IsString()
  @IsOptional()
  publicId?: string;

  @ApiPropertyOptional({ example: 'Imperial Zari Panjabi front angle' })
  @IsString()
  @IsOptional()
  altText?: string;

  @ApiPropertyOptional({ example: 0 })
  @IsNumber()
  @IsOptional()
  sortOrder?: number;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;
}

export class CreateProductDto {
  @ApiProperty({ example: 'Imperial Zari Embroidered Panjabi - Heritage Olive' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'imperial-zari-embroidered-panjabi-heritage-olive' })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiPropertyOptional({
    example: 'Handcrafted for solemn evening gatherings and celebratory Eid assemblies...',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsString()
  @MaxLength(300)
  @IsOptional()
  shortDescription?: string;

  @ApiProperty({ example: 3850 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ example: 3450 })
  @IsNumber()
  @IsOptional()
  compareAtPrice?: number;

  @ApiPropertyOptional({ example: 1620 })
  @IsNumber()
  @IsOptional()
  costPrice?: number;

  @ApiProperty({ example: 'RL-PNJ-25-C' })
  @IsString()
  @IsNotEmpty()
  sku: string;

  @ApiPropertyOptional({ enum: ['MEN', 'WOMEN', 'UNISEX'], default: 'MEN' })
  @IsEnum(['MEN', 'WOMEN', 'UNISEX'])
  @IsOptional()
  gender?: 'MEN' | 'WOMEN' | 'UNISEX' = 'MEN';

  @ApiPropertyOptional({ example: '100% Giza Egyptian Combed Cotton' })
  @IsString()
  @IsOptional()
  fabric?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  fabricOrigin?: string;

  @ApiPropertyOptional({ example: 'Tailored Slim Fit' })
  @IsString()
  @IsOptional()
  fit?: string;

  @ApiPropertyOptional({ minimum: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  gsm?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  careInstructions?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({ example: 5, default: 5 })
  @IsInt()
  @Min(0)
  @IsOptional()
  alertThreshold?: number;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isExpressAvailable?: boolean;

  @ApiProperty({ example: 'panjabi-cat-id' })
  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean = false;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  isNewArrival?: boolean = false;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  isBestSeller?: boolean = false;

  @ApiPropertyOptional({ type: [CreateVariantDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateVariantDto)
  @IsOptional()
  variants?: CreateVariantDto[];

  @ApiPropertyOptional({ type: [CreateProductImageDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductImageDto)
  @IsOptional()
  images?: CreateProductImageDto[];

  @ApiPropertyOptional({ example: 'Premium Mercerized Polo T-Shirt | Rongin Libas' })
  @IsString()
  @IsOptional()
  seoTitle?: string;

  @ApiPropertyOptional({
    example: "Premium men's polo T-shirt made from 100% mercerized pique cotton. Regular fit and refined everyday style from Rongin Libas.",
  })
  @IsString()
  @IsOptional()
  metaDescription?: string;

  @ApiPropertyOptional({ example: 'https://ronginlibas.com/products/premium-mercerized-polo-t-shirt' })
  @IsString()
  @IsOptional()
  canonicalUrl?: string;
}
