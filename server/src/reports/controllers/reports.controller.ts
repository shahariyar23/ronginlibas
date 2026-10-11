import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ReportsService } from '../services/reports.service.js';
import { ReportsQueryDto, ReportsPeriod } from '../dto/reports-query.dto.js';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Permissions } from '../../common/decorators/permissions.decorator.js';
import { UserRole } from '../../common/constants/roles.constant.js';

@ApiTags('Admin - Reports & Business Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
@Permissions('reports', 'dashboard', 'orders')
@Controller('admin/reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get()
  @ApiOperation({ summary: 'Retrieve verified real-time atelier business intelligence & performance reports' })
  @ApiQuery({ name: 'period', enum: ReportsPeriod, required: false })
  async getReports(@Query() query: ReportsQueryDto) {
    const data = await this.reportsService.generateReport(query.period);
    return {
      message: 'Business reports and analytics generated successfully',
      data,
    };
  }
}
