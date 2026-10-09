import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { UserRole } from '../../common/constants/roles.constant.js';
import { AuditQueryDto } from '../dto/audit-query.dto.js';
import { AuditService } from '../audit.service.js';

@ApiTags('Admin - Activity')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
@Controller('admin/activity')
export class AdminAuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @ApiOperation({ summary: 'List administrative activity and change history' })
  async findAll(@Query() query: AuditQueryDto) {
    const data = await this.auditService.findAll(query);
    return {
      message: 'Administrative activity retrieved successfully',
      data,
    };
  }
}
