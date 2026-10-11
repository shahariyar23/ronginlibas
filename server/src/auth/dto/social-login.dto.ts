import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SocialLoginDto {
  @ApiProperty({
    description: 'Firebase ID Token obtained after Google authentication',
    example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6Ij...',
  })
  @IsString()
  @IsNotEmpty()
  idToken: string;

  @ApiPropertyOptional({
    description: 'Optional customer name passed during initial social authorization',
    example: 'Mahfuzur Rahman',
  })
  @IsString()
  @IsOptional()
  fullName?: string;
}
