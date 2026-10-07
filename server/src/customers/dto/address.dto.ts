import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEmail, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class CreateAddressDto {
  @ApiProperty()
  @IsString()
  @MaxLength(120)
  fullName: string;

  @ApiPropertyOptional()
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty()
  @IsString()
  @Matches(/^(?:01[3-9]\d{8}|\+8801[3-9]\d{8})$/)
  phone: string;

  @ApiProperty()
  @IsString()
  @MaxLength(250)
  addressLine1: string;

  @ApiPropertyOptional()
  @IsString()
  @MaxLength(250)
  @IsOptional()
  addressLine2?: string;

  @ApiProperty()
  @IsString()
  @MaxLength(100)
  city: string;

  @ApiProperty()
  @IsString()
  @MaxLength(100)
  division: string;

  @ApiPropertyOptional()
  @IsString()
  @MaxLength(100)
  @IsOptional()
  area?: string;

  @ApiPropertyOptional()
  @IsString()
  @MaxLength(20)
  @IsOptional()
  postalCode?: string;

  @ApiPropertyOptional()
  @IsString()
  @MaxLength(500)
  @IsOptional()
  deliveryInstructions?: string;

  @ApiPropertyOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}

export class UpdateAddressDto {
  @ApiPropertyOptional()
  @IsString()
  @MaxLength(120)
  @IsOptional()
  fullName?: string;

  @ApiPropertyOptional()
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional()
  @IsString()
  @Matches(/^(?:01[3-9]\d{8}|\+8801[3-9]\d{8})$/)
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional()
  @IsString()
  @MaxLength(250)
  @IsOptional()
  addressLine1?: string;

  @ApiPropertyOptional()
  @IsString()
  @MaxLength(250)
  @IsOptional()
  addressLine2?: string;

  @ApiPropertyOptional()
  @IsString()
  @MaxLength(100)
  @IsOptional()
  city?: string;

  @ApiPropertyOptional()
  @IsString()
  @MaxLength(100)
  @IsOptional()
  division?: string;

  @ApiPropertyOptional()
  @IsString()
  @MaxLength(100)
  @IsOptional()
  area?: string;

  @ApiPropertyOptional()
  @IsString()
  @MaxLength(20)
  @IsOptional()
  postalCode?: string;

  @ApiPropertyOptional()
  @IsString()
  @MaxLength(500)
  @IsOptional()
  deliveryInstructions?: string;

  @ApiPropertyOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
