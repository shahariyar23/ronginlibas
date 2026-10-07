import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class MeasurementProfileDto {
  @ApiPropertyOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(500)
  @IsOptional()
  chest?: number;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(500)
  @IsOptional()
  shoulder?: number;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(500)
  @IsOptional()
  sleeveLength?: number;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(500)
  @IsOptional()
  collar?: number;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(500)
  @IsOptional()
  waist?: number;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(500)
  @IsOptional()
  trouserLength?: number;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(500)
  @IsOptional()
  garmentLength?: number;

  @ApiPropertyOptional()
  @IsString()
  @MaxLength(2000)
  @IsOptional()
  tailoringNotes?: string;
}
