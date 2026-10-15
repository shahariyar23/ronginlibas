import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class PaymentWebhookDto {
  @ApiPropertyOptional({ description: 'Customer full name', example: 'John Doe' })
  @IsString()
  @IsOptional()
  full_name?: string;

  @ApiPropertyOptional({ description: 'Customer email address', example: 'john@example.com' })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiProperty({ description: 'Authorized payment amount', example: '500.00' })
  @IsNotEmpty()
  amount: string | number;

  @ApiPropertyOptional({ description: 'Gateway processing fee', example: '1.50' })
  @IsOptional()
  fee?: string | number;

  @ApiPropertyOptional({ description: 'Total charged amount', example: '501.50' })
  @IsOptional()
  charged_amount?: string | number;

  @ApiProperty({ description: 'UddoktaPay invoice ID', example: '60839DE16AD' })
  @IsString()
  @IsNotEmpty()
  invoice_id: string;

  @ApiPropertyOptional({
    description: 'Metadata payload passed during session creation',
    example: { order_id: '...', order_number: '...', payment_attempt_id: '...' },
  })
  @IsOptional()
  metadata?: {
    order_id?: string;
    order_number?: string;
    payment_attempt_id?: string;
    [key: string]: any;
  };

  @ApiPropertyOptional({ description: 'Payment method channel (bKash, Nagad, Rocket, etc.)', example: 'bKash' })
  @IsString()
  @IsOptional()
  payment_method?: string;

  @ApiPropertyOptional({ description: 'Sender mobile or account number', example: '017XXXXXXXX' })
  @IsString()
  @IsOptional()
  sender_number?: string;

  @ApiPropertyOptional({ description: 'Transaction ID from payment network', example: 'TRX123456789' })
  @IsString()
  @IsOptional()
  transaction_id?: string;

  @ApiPropertyOptional({ description: 'Transaction timestamp', example: '2026-10-15 12:00:00' })
  @IsString()
  @IsOptional()
  date?: string;

  @ApiProperty({ description: 'Payment status from UddoktaPay (COMPLETED, PENDING, ERROR)', example: 'COMPLETED' })
  @IsString()
  @IsNotEmpty()
  status: string;
}

export class UddoktaWebhookPayloadDto extends PaymentWebhookDto {}
