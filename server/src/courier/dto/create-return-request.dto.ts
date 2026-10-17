import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateReturnRequestDto {
  @ApiPropertyOptional({
    description: 'Reason for requesting return / reverse courier collection',
    example: 'Customer requested size exchange at doorstep',
  })
  @IsString()
  @IsOptional()
  @MaxLength(300)
  reason?: string;
}
