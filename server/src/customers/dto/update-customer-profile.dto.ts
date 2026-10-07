import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class UpdateCustomerProfileDto {
  @ApiPropertyOptional()
  @IsString()
  @MaxLength(100)
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional()
  @IsString()
  @MaxLength(100)
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional({ example: '+8801712345678' })
  @IsString()
  @Matches(/^(?:01[3-9]\d{8}|\+8801[3-9]\d{8})$/)
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional()
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional()
  @IsString()
  @Matches(/^(?:01[3-9]\d{8}|\+8801[3-9]\d{8})$/)
  @IsOptional()
  secondaryPhone?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;

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

  @ApiPropertyOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  @IsOptional()
  marketingConsent?: boolean;
}
