var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
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
import { AuditService } from '../../audit/audit.service.js';
let AdminSettingsController = class AdminSettingsController {
    settingsService;
    auditService;
    constructor(settingsService, auditService) {
        this.settingsService = settingsService;
        this.auditService = auditService;
    }
    async getSettings() {
        const data = await this.settingsService.getSettings();
        return {
            message: 'Store settings retrieved successfully',
            data,
        };
    }
    async updateSettings(dto, actor) {
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
};
__decorate([
    Get(),
    ApiOperation({ summary: 'Retrieve full store information, delivery rates, and payment gateways' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminSettingsController.prototype, "getSettings", null);
__decorate([
    Patch(),
    ApiOperation({ summary: 'Update regional commerce rates, phone, or gateway parameters' }),
    __param(0, Body()),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [UpdateSettingsDto, Object]),
    __metadata("design:returntype", Promise)
], AdminSettingsController.prototype, "updateSettings", null);
AdminSettingsController = __decorate([
    ApiTags('Admin - Settings'),
    ApiBearerAuth(),
    UseGuards(JwtAuthGuard, RolesGuard),
    Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN),
    Permissions('settings'),
    Controller('admin/settings'),
    __metadata("design:paramtypes", [SettingsService,
        AuditService])
], AdminSettingsController);
export { AdminSettingsController };
//# sourceMappingURL=admin-settings.controller.js.map