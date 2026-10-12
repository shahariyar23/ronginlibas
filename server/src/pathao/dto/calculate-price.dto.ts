import { IsNumber, IsOptional, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CalculatePriceDto {
  @ApiPropertyOptional({ description: 'Merchant store ID', example: 1 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  store_id?: number;

  @ApiPropertyOptional({ description: '1 for Document, 2 for Parcel', default: 2 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  item_type: number = 2;

  @ApiPropertyOptional({ description: '48 for Normal Delivery, 12 for On Demand', default: 48 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  delivery_type: number = 48;

  @ApiProperty({ description: 'Package weight in KG', example: 0.5 })
  @IsNumber()
  @Min(0.1)
  @Max(50)
  @Type(() => Number)
  item_weight: number;

  @ApiProperty({ description: 'Destination City ID from Pathao', example: 1 })
  @IsNumber()
  @Type(() => Number)
  recipient_city: number;

  @ApiProperty({ description: 'Destination Zone ID from Pathao', example: 1 })
  @IsNumber()
  @Type(() => Number)
  recipient_zone: number;
}
