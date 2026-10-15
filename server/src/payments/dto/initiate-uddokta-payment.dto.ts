import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class InitiateUddoktaPaymentDto {
  @ApiProperty({
    description: 'Internal order ID (UUID) or customer order reference (#RL...)',
    example: '7c5d2f5d-69f8-454f-8b15-2026fca797e6',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  orderId: string;

  @ApiPropertyOptional({
    description: 'Contact phone for guest order access verification',
    example: '01711223344',
  })
  @IsString()
  @IsOptional()
  @MaxLength(25)
  phone?: string;

  @ApiPropertyOptional({
    description: 'Guest tracking token for guest order access verification',
  })
  @IsString()
  @IsOptional()
  @MaxLength(128)
  trackingToken?: string;
}
