import {
  IsString,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsInt,
  Min,
  IsOptional,
  IsEnum,
  IsObject,
  IsEmail,
  MaxLength,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrderItemDto {
  @ApiProperty({ example: 'product-id' })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ example: 'variant-id' })
  @IsString()
  @IsNotEmpty()
  variantId: string;

  @ApiProperty({ example: 1, minimum: 1 })
  @IsInt()
  @Min(1)
  quantity: number;
}

export class ShippingAddressDto {
  @ApiProperty({ example: 'House 42, Road 11, Block D' })
  @IsString()
  @IsNotEmpty()
  addressLine1: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  addressLine2?: string;

  @ApiProperty({ example: 'Gulshan-2' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: 'Dhaka' })
  @IsString()
  @IsNotEmpty()
  division: string;

  @ApiProperty({ example: '01711234567' })
  @IsString()
  @Matches(/^(?:01[3-9]\d{8}|\+8801[3-9]\d{8})$/)
  @IsNotEmpty()
  phone: string;

  @ApiPropertyOptional()
  @IsString()
  @MaxLength(120)
  @IsOptional()
  fullName?: string;

  @ApiPropertyOptional()
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional()
  @IsString()
  @MaxLength(100)
  @IsOptional()
  area?: string;

  @ApiPropertyOptional()
  @IsString()
  @MaxLength(20)
  @IsOptional()
  postalCode?: string;

  @ApiPropertyOptional()
  @IsString()
  @MaxLength(500)
  @IsOptional()
  deliveryInstructions?: string;
}

export class CreateOrderDto {
  @ApiProperty({ type: [CreateOrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];

  @ApiProperty({ type: ShippingAddressDto })
  @IsObject()
  @ValidateNested()
  @Type(() => ShippingAddressDto)
  shippingAddress: ShippingAddressDto;

  @ApiPropertyOptional({ enum: ['COD', 'BKASH', 'NAGAD', 'CARD', 'WAITMARK_PAY', 'UDDOKTAPAY'], default: 'COD' })
  @IsEnum(['COD', 'BKASH', 'NAGAD', 'CARD', 'WAITMARK_PAY', 'UDDOKTAPAY'])
  @IsOptional()
  paymentMethod?: 'COD' | 'BKASH' | 'NAGAD' | 'CARD' | 'WAITMARK_PAY' | 'UDDOKTAPAY' = 'COD';

  @ApiPropertyOptional({ example: 'EID2026' })
  @IsString()
  @IsOptional()
  couponCode?: string;

  @ApiPropertyOptional()
  @IsString()
  @MaxLength(1000)
  @IsOptional()
  customerNotes?: string;

  @ApiPropertyOptional({ description: 'Required for guest checkout; ignored when authenticated' })
  @IsString()
  @MaxLength(120)
  @IsOptional()
  guestName?: string;

  @ApiPropertyOptional({ description: 'Required for guest checkout' })
  @IsEmail()
  @IsOptional()
  guestEmail?: string;

  @ApiPropertyOptional()
  @IsString()
  @MaxLength(1000)
  @IsOptional()
  customTailoringNote?: string;
}
