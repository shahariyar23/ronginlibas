import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreatePaymentDto {
  @ApiProperty()
  @IsString()
  @MaxLength(40)
  orderNumber: string;

  @ApiProperty({ enum: ['BKASH', 'NAGAD', 'CARD'] })
  @IsIn(['BKASH', 'NAGAD', 'CARD'])
  provider: 'BKASH' | 'NAGAD' | 'CARD';

  @ApiPropertyOptional()
  @IsString()
  @MaxLength(20)
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional()
  @IsString()
  @MaxLength(100)
  @IsOptional()
  trackingToken?: string;
}

export class VerifyPaymentDto {
  @ApiProperty()
  @IsString()
  @MaxLength(100)
  transactionId: string;
}
