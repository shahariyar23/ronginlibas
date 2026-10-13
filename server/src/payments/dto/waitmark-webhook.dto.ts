import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class WaitmarkWebhookPayloadDto {
  @ApiProperty({ description: 'Merchant order identifier / payment attempt ID', example: 'WMPAY-RL559840-ABCD' })
  @IsString()
  @IsNotEmpty()
  order_id: string;

  @ApiProperty({ description: 'Waitmark unique transaction identifier', example: 'WM7X9K2P1Q' })
  @IsString()
  @IsNotEmpty()
  trx_id: string;

  @ApiProperty({ description: 'Authorized payment amount', example: '500.00' })
  @IsNotEmpty()
  amount: string | number;

  @ApiProperty({ description: 'Currency code', example: 'BDT' })
  @IsString()
  @IsNotEmpty()
  currency: string;

  @ApiProperty({ description: 'Payment status from Waitmark', example: 'completed' })
  @IsString()
  @IsNotEmpty()
  status: string;

  @ApiPropertyOptional({ description: 'ISO timestamp when transaction was completed', example: '2026-07-28T14:30:00Z' })
  @IsString()
  @IsOptional()
  paid_at?: string;
}
