import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ChangeUserPasswordDto {
  @ApiPropertyOptional({ example: 'CurrentSecret123' })
  @IsString()
  @IsOptional()
  currentPassword?: string;

  @ApiProperty({ example: 'MyNewSecret123' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'New password must be at least 6 characters long' })
  newPassword: string;
}
