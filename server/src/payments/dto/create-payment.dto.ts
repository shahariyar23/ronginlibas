import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreatePaymentDto {
  @ApiProperty({ description: 'Order ID or order number (#RL...)', example: '#RL1001' })
  @IsString()
  @MaxLength(60)
  orderNumber: string;

  @ApiProperty({ enum: ['BKASH', 'NAGAD', 'CARD', 'UDDOKTAPAY', 'WAITMARK_PAY'] })
  @IsIn(['BKASH', 'NAGAD', 'CARD', 'UDDOKTAPAY', 'WAITMARK_PAY'])
  provider: 'BKASH' | 'NAGAD' | 'CARD' | 'UDDOKTAPAY' | 'WAITMARK_PAY';

  @ApiPropertyOptional({ description: 'Contact phone for guest order access' })
  @IsString()
  @MaxLength(25)
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ description: 'Guest tracking token for guest order access' })
  @IsString()
  @MaxLength(128)
  @IsOptional()
  trackingToken?: string;
}
