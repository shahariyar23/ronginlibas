import { IsString, IsNotEmpty, IsInt, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AdjustStockDto {
  @ApiProperty({ example: 'variant-uuid-or-id' })
  @IsString()
  @IsNotEmpty()
  variantId: string;

  @ApiProperty({ example: 10, description: 'Positive to add stock, negative to reduce' })
  @IsInt()
  quantityChange: number;

  @ApiPropertyOptional({
    enum: ['PURCHASE', 'SALE', 'RETURN', 'ADJUSTMENT', 'RESTOCK'],
    default: 'RESTOCK',
  })
  @IsEnum(['PURCHASE', 'SALE', 'RETURN', 'ADJUSTMENT', 'RESTOCK'])
  @IsOptional()
  type?: 'PURCHASE' | 'SALE' | 'RETURN' | 'ADJUSTMENT' | 'RESTOCK' = 'RESTOCK';

  @ApiPropertyOptional({ example: 'Atelier loom batch restock - Dhaka unit' })
  @IsString()
  @IsOptional()
  note?: string;

  @ApiPropertyOptional({
    enum: [
      'RESTOCK',
      'SALE',
      'RETURN',
      'EXCHANGE',
      'DAMAGED',
      'LOST',
      'MANUAL_ADJUSTMENT',
      'ORDER_CANCELLED',
    ],
    example: 'RESTOCK',
  })
  @IsString()
  @IsOptional()
  reason?: string;
}

