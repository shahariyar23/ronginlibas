import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { DashboardService } from '../services/dashboard.service.js';
import { DashboardQueryDto } from '../dto/dashboard-query.dto.js';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { UserRole } from '../../common/constants/roles.constant.js';

@ApiTags('Admin - Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
@Controller('admin/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @ApiOperation({ summary: 'Retrieve full executive atelier performance ledger metrics' })
  @ApiQuery({ name: 'period', enum: ['7', '30', 'month'], required: false })
  async getMetrics(@Query() query: DashboardQueryDto) {
    const data = await this.dashboardService.getAdminDashboardMetrics(query.period);
    return {
      message: 'Atelier dashboard metrics retrieved successfully',
      data,
    };
  }
}
