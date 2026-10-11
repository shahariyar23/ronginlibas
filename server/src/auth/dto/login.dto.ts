import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'patron@ronginlibas.com or +8801712345678' })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'AtelierSecret2026!' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
