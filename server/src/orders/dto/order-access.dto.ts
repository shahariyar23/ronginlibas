import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class OrderAccessDto {
  @ApiPropertyOptional({ description: 'Guest phone number used at checkout' })
  @IsString()
  @MaxLength(20)
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ description: 'One-time guest tracking token returned after checkout' })
  @IsString()
  @MaxLength(100)
  @IsOptional()
  trackingToken?: string;
}
