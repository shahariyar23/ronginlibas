import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus } from '@prisma/client';

export class UpdateOrderStatusDto {
  @ApiProperty({
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
  @IsNotEmpty()
  status:
    | OrderStatus;

  @ApiPropertyOptional({ example: 'Dispatched with Steadfast Courier #SF89234' })
  @IsString()
  @IsOptional()
  adminNotes?: string;
}
