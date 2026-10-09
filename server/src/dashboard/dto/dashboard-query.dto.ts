import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import type { DashboardPeriod } from '../services/dashboard.service.js';

export class DashboardQueryDto {
  @ApiPropertyOptional({ enum: ['7', '30', 'month'], default: '7' })
  @IsIn(['7', '30', 'month'])
  @IsOptional()
  period?: DashboardPeriod;
}
