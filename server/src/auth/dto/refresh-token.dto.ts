import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiPropertyOptional({
    description: 'Legacy admin refresh token; customer tokens use the HTTP-only cookie',
  })
  @IsString()
  @IsOptional()
  refreshToken?: string;
}
