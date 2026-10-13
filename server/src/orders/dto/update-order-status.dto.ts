import { IsDateString, IsEnum, IsObject, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus } from '@prisma/client';

export class UpdateOrderStatusDto {
  @ApiPropertyOptional({
    enum: [
      'PENDING',
      'CONFIRMED',
      'PROCESSING',
      'PACKED',
      'SHIPPED',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
      'CANCELLED',
      'RETURN_REQUESTED',
      'RETURNED',
      'REFUNDED',
    ],
  })
  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;

  @ApiPropertyOptional({ example: 'Dispatched with Steadfast Courier #SF89234' })
  @IsString()
  @IsOptional()
  adminNotes?: string;

  @ApiPropertyOptional({ example: 'Steadfast Courier' })
  @IsString()
  @IsOptional()
  courierName?: string;

  @ApiPropertyOptional({ example: 'SF89234' })
  @IsString()
  @IsOptional()
  trackingNumber?: string;

  @ApiPropertyOptional({ example: 'https://steadfast.com.bd/track/SF89234' })
  @IsString()
  @IsOptional()
  trackingUrl?: string;

  @ApiPropertyOptional({ example: '2026-10-15T00:00:00.000Z' })
  @IsDateString()
  @IsOptional()
  estimatedDelivery?: string;

  @ApiPropertyOptional({ description: 'Updated shipping address details' })
  @IsObject()
  @IsOptional()
  shippingAddress?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Explicit override to bypass automated courier status checks' })
  @IsOptional()
  overrideCourierStatus?: boolean;
}
