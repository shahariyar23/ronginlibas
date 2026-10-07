import {
  Equals,
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class RegisterCustomerDto {
  @ApiProperty({ example: '01711234567' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^(?:01[3-9]\d{8}|\+8801[3-9]\d{8})$/)
  phone: string;

  @ApiProperty({ example: 'Rahim' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName: string;

  @ApiPropertyOptional({ example: 'Chowdhury' })
  @IsString()
  @MaxLength(100)
  @IsOptional()
  lastName?: string;

  @ApiProperty({ example: 'rahim@gmail.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'SecurePassword123' })
  @IsString()
  @MinLength(10)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)
  password: string;

  @ApiProperty()
  @IsString()
  confirmPassword: string;

  @ApiPropertyOptional()
  @IsString()
  @MaxLength(20)
  @IsOptional()
  preferredSize?: string;

  @ApiPropertyOptional()
  @IsString()
  @MaxLength(50)
  @IsOptional()
  preferredFit?: string;

  @ApiProperty({ default: true })
  @Transform(({ value }) => value === true || value === 'true')
  @Equals(true)
  termsAccepted: boolean;

  @ApiPropertyOptional({ default: false })
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  @IsOptional()
  marketingConsent?: boolean;
}
