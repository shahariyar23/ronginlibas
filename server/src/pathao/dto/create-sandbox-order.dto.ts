import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSandboxOrderDto {
  @ApiPropertyOptional({ description: 'Merchant store ID', example: 1 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  store_id?: number;

  @ApiPropertyOptional({ description: 'Merchant order reference', example: '#RL1001' })
  @IsOptional()
  @IsString()
  merchant_order_id?: string;

  @ApiProperty({ description: 'Recipient customer name', example: 'Farhana Ahmed' })
  @IsString()
  @IsNotEmpty({ message: 'Recipient name cannot be empty' })
  recipient_name: string;

  @ApiProperty({ description: '11-digit Bangladesh mobile number', example: '01712088866' })
  @IsString()
  @IsNotEmpty({ message: 'Recipient phone number is required' })
  @Matches(/^(?:\+88|88)?01[3-9]\d{8}$/, {
    message: 'Recipient phone must be a valid 11-digit Bangladeshi mobile number (e.g., 017xxxxxxxx)',
  })
  recipient_phone: string;

  @ApiProperty({ description: 'Full physical delivery address with street and area', example: 'House 14, Road 5, Block C, Banani' })
  @IsString()
  @IsNotEmpty({ message: 'Recipient address cannot be empty' })
  recipient_address: string;

  @ApiPropertyOptional({ description: 'Destination city ID', example: 1 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  recipient_city?: number;

  @ApiPropertyOptional({ description: 'Destination zone ID', example: 1 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  recipient_zone?: number;

  @ApiPropertyOptional({ description: 'Destination area ID', example: 1 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  recipient_area?: number;

  @ApiPropertyOptional({ description: 'Delivery type: 48 = Normal, 12 = On Demand', default: 48 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  delivery_type: number = 48;

  @ApiPropertyOptional({ description: 'Item type: 1 = Document, 2 = Parcel', default: 2 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  item_type: number = 2;

  @ApiPropertyOptional({ description: 'Special delivery instructions', example: 'Fragile luxury garment - deliver by afternoon' })
  @IsOptional()
  @IsString()
  special_instruction?: string;

  @ApiProperty({ description: 'Total item quantity in consignment', example: 1 })
  @IsNumber()
  @Min(1, { message: 'Item quantity must be at least 1' })
  @Type(() => Number)
  item_quantity: number = 1;

  @ApiProperty({ description: 'Weight in KG (e.g. 0.5)', example: 0.5 })
  @IsNotEmpty({ message: 'Item weight is required' })
  item_weight: number | string;

  @ApiProperty({ description: 'COD amount to collect in BDT (0 if prepaid)', example: 1500 })
  @IsNumber()
  @Min(0, { message: 'Amount to collect cannot be negative' })
  @Type(() => Number)
  amount_to_collect: number;

  @ApiProperty({ description: 'Brief item description', example: 'Silk Festive Panjabi & Kurti' })
  @IsString()
  @IsNotEmpty({ message: 'Item description is required' })
  item_description: string;
}
