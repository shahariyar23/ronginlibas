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
  @Transform(({ value }) => typeof value === 'string' ? value.replace(/[\s()-]/g, '') : value)
  @Matches(/^(?:\+?880)?0?1[3-9]\d{8}$/, {
    message: 'Please provide a valid Bangladeshi phone number (e.g. 017XXXXXXXX or 17XXXXXXXX)',
  })
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
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
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
