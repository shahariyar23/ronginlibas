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
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus } from '@prisma/client';

export class CreateAdminOrderCustomerDto {
  @ApiPropertyOptional({ example: 'Mostak Shahariyar' })
  @IsString()
  @IsOptional()
  @MaxLength(120)
  fullName?: string;

  @ApiPropertyOptional({ example: 'Mostak' })
  @IsString()
  @IsOptional()
  @MaxLength(60)
  firstName?: string;

  @ApiPropertyOptional({ example: 'Shahariyar' })
  @IsString()
  @IsOptional()
  @MaxLength(60)
  lastName?: string;

  @ApiPropertyOptional({ example: '01916664011' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: '01916664011' })
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiPropertyOptional({ example: 'customer@example.com' })
  @IsEmail()
  @IsOptional()
  email?: string;
}

export class CreateAdminOrderItemDto {
  @ApiPropertyOptional({ example: 'product-id' })
  @IsString()
  @IsOptional()
  productId?: string;

  @ApiPropertyOptional({ example: 'variant-id' })
  @IsString()
  @IsOptional()
  variantId?: string;

  @ApiPropertyOptional({ example: 'variant-id' })
  @IsString()
  @IsOptional()
  productVariantId?: string;

  @ApiProperty({ example: 1, minimum: 1 })
  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateAdminOrderAddressDto {
  @ApiPropertyOptional({ example: 'House 42, Road 11' })
  @IsString()
  @IsOptional()
  addressLine1?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  addressLine2?: string;

  @ApiPropertyOptional({ example: 'House 42, Road 11' })
  @IsString()
  @IsOptional()
  streetAddress?: string;

  @ApiPropertyOptional({ example: 'Dhaka' })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({ example: 'Dhaka' })
  @IsString()
  @IsOptional()
  district?: string;

  @ApiPropertyOptional({ example: 'Mirpur' })
  @IsString()
  @IsOptional()
  thana?: string;

  @ApiPropertyOptional({ example: 'Mirpur' })
  @IsString()
  @IsOptional()
  area?: string;

  @ApiPropertyOptional({ example: 'Dhaka' })
  @IsString()
  @IsOptional()
  division?: string;

  @ApiPropertyOptional({ example: '1216' })
  @IsString()
  @IsOptional()
  postalCode?: string;

  @ApiPropertyOptional({ example: '01916664011' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: '01916664011' })
  @IsString()
  @IsOptional()
  receiverPhone?: string;

  @ApiPropertyOptional({ example: 'Mostak Shahariyar' })
  @IsString()
  @IsOptional()
  fullName?: string;

  @ApiPropertyOptional({ example: 'Mostak Shahariyar' })
  @IsString()
  @IsOptional()
  receiverName?: string;

  @ApiPropertyOptional({ example: 'customer@example.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  deliveryInstructions?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreateAdminOrderDto {
  @ApiPropertyOptional({ description: 'ID of an existing registered customer' })
  @IsString()
  @IsOptional()
  customerId?: string;

  @ApiPropertyOptional({ type: CreateAdminOrderCustomerDto, description: 'Details for walk-in or new customer' })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => CreateAdminOrderCustomerDto)
  customer?: CreateAdminOrderCustomerDto;

  @ApiPropertyOptional({ type: CreateAdminOrderCustomerDto, description: 'Details for walk-in or new customer' })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => CreateAdminOrderCustomerDto)
  newCustomer?: CreateAdminOrderCustomerDto;

  @ApiPropertyOptional({ description: 'ID of an existing saved address for this customer' })
  @IsString()
  @IsOptional()
  addressId?: string;

  @ApiPropertyOptional({ type: CreateAdminOrderAddressDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => CreateAdminOrderAddressDto)
  shippingAddress?: CreateAdminOrderAddressDto;

  @ApiProperty({ type: [CreateAdminOrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAdminOrderItemDto)
  items: CreateAdminOrderItemDto[];

  @ApiPropertyOptional({ example: 'EID2026' })
  @IsString()
  @IsOptional()
  couponCode?: string;

  @ApiPropertyOptional({ enum: ['FIXED', 'PERCENTAGE'] })
  @IsEnum(['FIXED', 'PERCENTAGE'])
  @IsOptional()
  manualDiscountType?: 'FIXED' | 'PERCENTAGE';

  @ApiPropertyOptional({ example: 200 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  manualDiscountValue?: number;

  @ApiPropertyOptional({ example: 100 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  deliveryCharge?: number;

  @ApiPropertyOptional({ enum: ['COD', 'BKASH', 'NAGAD', 'CARD', 'WAITMARK_PAY', 'UDDOKTAPAY'], default: 'COD' })
  @IsString()
  @IsOptional()
  paymentMethod?: string = 'COD';

  @ApiPropertyOptional({ enum: ['UNPAID', 'PENDING', 'PAID', 'PARTIALLY_PAID', 'FAILED', 'REFUNDED'], default: 'PENDING' })
  @IsEnum(['UNPAID', 'PENDING', 'PAID', 'PARTIALLY_PAID', 'FAILED', 'REFUNDED'])
  @IsOptional()
  paymentStatus?: string = 'PENDING';

  @ApiPropertyOptional({ description: 'Transaction ID or payment reference note' })
  @IsString()
  @MaxLength(255)
  @IsOptional()
  paymentReference?: string;

  @ApiPropertyOptional({ example: 500 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  paidAmount?: number;

  @ApiPropertyOptional({ example: 'Steadfast Courier' })
  @IsString()
  @MaxLength(120)
  @IsOptional()
  courierName?: string;

  @ApiPropertyOptional({ example: 'Steadfast' })
  @IsString()
  @MaxLength(120)
  @IsOptional()
  courierProvider?: string;

  @ApiPropertyOptional({ example: 'STANDARD' })
  @IsString()
  @MaxLength(120)
  @IsOptional()
  shippingMethod?: string;

  @ApiPropertyOptional({ enum: OrderStatus, default: OrderStatus.PENDING })
  @IsEnum(OrderStatus)
  @IsOptional()
  orderStatus?: OrderStatus = OrderStatus.PENDING;

  @ApiPropertyOptional({ example: 'ADMIN', default: 'ADMIN' })
  @IsString()
  @MaxLength(50)
  @IsOptional()
  source?: string = 'ADMIN';

  @ApiPropertyOptional()
  @IsString()
  @MaxLength(1000)
  @IsOptional()
  customerNotes?: string;

  @ApiPropertyOptional()
  @IsString()
  @MaxLength(1000)
  @IsOptional()
  adminNotes?: string;
}
