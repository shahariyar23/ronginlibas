import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class SteadfastWebhookDto {
  @ApiPropertyOptional({ description: 'Notification type sent by Steadfast', example: 'delivery_status' })
  @IsString()
  @IsOptional()
  notification_type?: string;

  @ApiPropertyOptional({ description: 'Steadfast Consignment ID', example: '123456' })
  @IsOptional()
  consignment_id?: string | number;

  @ApiPropertyOptional({ description: 'Merchant invoice number', example: 'RL-INV-2026-000001' })
  @IsString()
  @IsOptional()
  invoice?: string;

  @ApiPropertyOptional({ description: 'Steadfast tracking code', example: 'ST123456' })
  @IsString()
  @IsOptional()
  tracking_code?: string;

  @ApiPropertyOptional({ description: 'Delivery status', example: 'delivered' })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ description: 'Alternative delivery status key', example: 'delivered' })
  @IsString()
  @IsOptional()
  delivery_status?: string;

  @ApiPropertyOptional({ description: 'Collected or remaining COD amount', example: 1500 })
  @IsOptional()
  cod_amount?: number;

  [key: string]: unknown;
}
