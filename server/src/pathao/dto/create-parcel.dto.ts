import { IsBoolean, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateParcelDto {
  @ApiPropertyOptional({ description: 'Specific merchant store ID for pickup', example: 1 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  store_id?: number;

  @ApiPropertyOptional({ description: 'Special delivery note or instruction' })
  @IsOptional()
  @IsString()
  special_instruction?: string;

  @ApiPropertyOptional({ description: 'Custom package weight in KG (defaults to calculated garment weight)', example: 0.8 })
  @IsOptional()
  @Min(0.1)
  item_weight?: number;

  @ApiPropertyOptional({ description: 'Delivery type: 48 = Standard (default), 12 = On demand', default: 48 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  delivery_type?: number;

  @ApiPropertyOptional({ description: 'Destination city ID if overriding automatic resolution' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  recipient_city?: number;

  @ApiPropertyOptional({ description: 'Destination zone ID if overriding automatic resolution' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  recipient_zone?: number;

  @ApiPropertyOptional({ description: 'Destination area ID if overriding automatic resolution' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  recipient_area?: number;

  @ApiPropertyOptional({ description: 'Force booking another parcel even if order was previously booked in sandbox' })
  @IsOptional()
  @IsBoolean()
  forceDuplicate?: boolean;
}
