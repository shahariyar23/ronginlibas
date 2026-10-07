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
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator.js';
import { SettingsService } from '../services/settings.service.js';
let StoreSettingsController = class StoreSettingsController {
    settingsService;
    constructor(settingsService) {
        this.settingsService = settingsService;
    }
    async getSettings() {
        return {
            message: 'Store settings retrieved successfully',
            data: await this.settingsService.getPublicSettings(),
        };
    }
};
__decorate([
    Get('settings'),
    ApiOperation({ summary: 'Retrieve customer-safe store configuration' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], StoreSettingsController.prototype, "getSettings", null);
StoreSettingsController = __decorate([
    ApiTags('Storefront'),
    Public(),
    Controller('store'),
    __metadata("design:paramtypes", [SettingsService])
], StoreSettingsController);
export { StoreSettingsController };
//# sourceMappingURL=store-settings.controller.js.map