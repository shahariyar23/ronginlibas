import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class MeasurementProfileDto {
  @ApiPropertyOptional({ type: Number, example: 14.4 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(500)
  @IsOptional()
  chest?: number;

  @ApiPropertyOptional({ type: Number, example: 16.4 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(500)
  @IsOptional()
  shoulder?: number;

  @ApiPropertyOptional({ type: Number, example: 14.4 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(500)
  @IsOptional()
  sleeveLength?: number;

  @ApiPropertyOptional({ type: Number, example: 14.4 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(500)
  @IsOptional()
  collar?: number;

  @ApiPropertyOptional({ type: Number, example: 16.4 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(500)
  @IsOptional()
  waist?: number;

  @ApiPropertyOptional({ type: Number, example: 32.5 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(500)
  @IsOptional()
  trouserLength?: number;

  @ApiPropertyOptional({ type: Number, example: 157.48 })
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
