var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SettingsService } from '../services/settings.service.js';
import { Public } from '../../common/decorators/public.decorator.js';
let SettingsController = class SettingsController {
    settingsService;
    constructor(settingsService) {
        this.settingsService = settingsService;
    }
    async getPublicSettings() {
        const data = await this.settingsService.getPublicSettings();
        return {
            message: 'Store configurations retrieved successfully',
            data,
        };
    }
};
__decorate([
    Get('public'),
    ApiOperation({ summary: 'Retrieve public store details, contact channels, and delivery rates' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "getPublicSettings", null);
SettingsController = __decorate([
    ApiTags('Storefront - Settings'),
    Public(),
    Controller('settings'),
    __metadata("design:paramtypes", [SettingsService])
], SettingsController);
export { SettingsController };
//# sourceMappingURL=settings.controller.js.map