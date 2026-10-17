import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateShipmentDto {
  @ApiPropertyOptional({
    description: 'Special courier instructions for delivery rider (e.g. Fragile silk garment, call before delivery)',
    example: 'Deliver during afternoon hours',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  note?: string;
}
