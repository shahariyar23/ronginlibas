import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class VerifyPaymentDto {
  @ApiProperty({
    description: 'UddoktaPay invoice ID or gateway transaction reference',
    example: '60839DE16AD',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  invoiceId: string;

  @ApiPropertyOptional({
    description: 'Order reference or ID for validation',
    example: '7c5d2f5d-69f8-454f-8b15-2026fca797e6',
  })
  @IsString()
  @IsOptional()
  @MaxLength(60)
  orderId?: string;
}

export class VerifyUddoktaPaymentDto extends VerifyPaymentDto {}
