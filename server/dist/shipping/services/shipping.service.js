var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from '@nestjs/common';
import { SettingsService } from '../../settings/services/settings.service.js';
let ShippingService = class ShippingService {
    settingsService;
    constructor(settingsService) {
        this.settingsService = settingsService;
    }
    async getDeliveryZones() {
        const settings = await this.settingsService.getPublicSettings();
        return [
            {
                id: 'dhaka-metro',
                name: 'Dhaka Metropolitan',
                charge: settings.dhakaDeliveryCharge,
                freeShippingEnabled: settings.freeShippingEnabled,
                freeDeliveryThreshold: settings.freeDeliveryThreshold,
            },
            {
                id: 'nationwide',
                name: 'Bangladesh-wide',
                charge: settings.outsideDhakaDeliveryCharge,
                freeShippingEnabled: settings.freeShippingEnabled,
                freeDeliveryThreshold: settings.freeDeliveryThreshold,
            },
        ];
    }
};
ShippingService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [SettingsService])
], ShippingService);
export { ShippingService };
//# sourceMappingURL=shipping.service.js.map