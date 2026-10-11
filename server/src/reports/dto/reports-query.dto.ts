import { IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum ReportsPeriod {
  SEVEN_DAYS = '7d',
  THIRTY_DAYS = '30d',
  NINETY_DAYS = '90d',
  ONE_YEAR = '1y',
  ALL = 'all',
}

export class ReportsQueryDto {
  @ApiPropertyOptional({ enum: ReportsPeriod, default: ReportsPeriod.THIRTY_DAYS })
  @IsEnum(ReportsPeriod)
  @IsOptional()
  period?: ReportsPeriod = ReportsPeriod.THIRTY_DAYS;
}
