import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SettingsService } from '../services/settings.service.js';
import { UpdateSettingsDto } from '../dto/update-settings.dto.js';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Permissions } from '../../common/decorators/permissions.decorator.js';
import { UserRole } from '../../common/constants/roles.constant.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { AuditService, AdminAuditActor } from '../../audit/audit.service.js';

@ApiTags('Admin - Settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
@Permissions('settings')
@Controller('admin/settings')
export class AdminSettingsController {
  constructor(
    private readonly settingsService: SettingsService,
    private readonly auditService: AuditService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Retrieve full store information, delivery rates, and payment gateways' })
  async getSettings() {
    const data = await this.settingsService.getSettings();
    return {
      message: 'Store settings retrieved successfully',
      data,
    };
  }

  @Patch()
  @ApiOperation({ summary: 'Update regional commerce rates, phone, or gateway parameters' })
  async updateSettings(
    @Body() dto: UpdateSettingsDto,
    @CurrentUser() actor: AdminAuditActor,
  ) {
    const before = await this.settingsService.getSettings();
    const data = await this.settingsService.updateSettings(dto);
    await this.auditService.record({
      actor,
      module: 'settings',
      action: 'SETTINGS_UPDATED',
      entityType: 'store_settings',
      entityLabel: 'Store Settings',
      summary: `Updated store settings: ${Object.keys(dto).join(', ') || 'no fields'}`,
      before,
      after: data,
    });
    return {
      message: 'Store settings updated successfully',
      data,
    };
  }
}
