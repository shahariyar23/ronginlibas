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
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateVariantDto {
  @ApiProperty({ example: '40' })
  @IsString()
  @IsNotEmpty()
  size: string;

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
}

export class CreateProductImageDto {
  @ApiProperty({ example: 'https://images.example.com/panjabi-1.jpg' })
  @IsString()
  @IsNotEmpty()
  url: string;

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

  @ApiPropertyOptional({ example: 'Tailored Slim Fit' })
  @IsString()
  @IsOptional()
  fit?: string;

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

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  isNewArrival?: boolean = true;

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
}
