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
import { Public } from '../common/decorators/public.decorator.js';
import { StorefrontService } from './storefront.service.js';
let StorefrontController = class StorefrontController {
    storefrontService;
    constructor(storefrontService) {
        this.storefrontService = storefrontService;
    }
    async getHome() {
        return {
            message: 'Storefront homepage retrieved successfully',
            data: await this.storefrontService.getHome(),
        };
    }
};
__decorate([
    Get('home'),
    ApiOperation({ summary: 'Load dynamic customer storefront homepage data' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], StorefrontController.prototype, "getHome", null);
StorefrontController = __decorate([
    ApiTags('Storefront'),
    Public(),
    Controller('storefront'),
    __metadata("design:paramtypes", [StorefrontService])
], StorefrontController);
export { StorefrontController };
//# sourceMappingURL=storefront.controller.js.map