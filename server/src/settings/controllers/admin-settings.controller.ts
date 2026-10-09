import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SettingsService } from '../services/settings.service.js';
import { UpdateSettingsDto } from '../dto/update-settings.dto.js';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Permissions } from '../../common/decorators/permissions.decorator.js';
import { UserRole } from '../../common/constants/roles.constant.js';

@ApiTags('Admin - Settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
@Permissions('settings')
@Controller('admin/settings')
export class AdminSettingsController {
  constructor(private readonly settingsService: SettingsService) {}

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
  async updateSettings(@Body() dto: UpdateSettingsDto) {
    const data = await this.settingsService.updateSettings(dto);
    return {
      message: 'Store settings updated successfully',
      data,
    };
  }
}
