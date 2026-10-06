import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSettingsDto {
  @ApiPropertyOptional({ example: 'Rongin Libas' })
  @IsString()
  @IsOptional()
  storeName?: string;

  @ApiPropertyOptional({ example: '01916664011' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: '01916664011' })
  @IsString()
  @IsOptional()
  whatsapp?: string;

  @ApiPropertyOptional({ example: 'concierge@ronginlibas.com' })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: 'https://ronginlibas.com' })
  @IsString()
  @IsOptional()
  website?: string;

  @ApiPropertyOptional({ example: 'https://facebook.com/ronginlibas.bd' })
  @IsString()
  @IsOptional()
  facebook?: string;

  @ApiPropertyOptional({ example: 80 })
  @IsNumber()
  @IsOptional()
  dhakaDeliveryCharge?: number;

  @ApiPropertyOptional({ example: 150 })
  @IsNumber()
  @IsOptional()
  outsideDhakaDeliveryCharge?: number;

  @ApiPropertyOptional({ example: 3000 })
  @IsNumber()
  @IsOptional()
  freeDeliveryThreshold?: number;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  codEnabled?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  bkashEnabled?: boolean;

  @ApiPropertyOptional({ example: '01711223344' })
  @IsString()
  @IsOptional()
  bkashWallet?: string;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  nagadEnabled?: boolean;

  @ApiPropertyOptional({ example: '01822554499' })
  @IsString()
  @IsOptional()
  nagadWallet?: string;

  @ApiPropertyOptional({ example: 'BDT' })
  @IsString()
  @IsOptional()
  currency?: string;
}
