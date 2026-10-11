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
import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { OffersService } from '../services/offers.service.js';
import { QueryOffersDto } from '../dto/query-offers.dto.js';
import { Public } from '../../common/decorators/public.decorator.js';
let OffersController = class OffersController {
    offersService;
    constructor(offersService) {
        this.offersService = offersService;
    }
    async getStorefrontOffers(query) {
        const data = await this.offersService.getStorefrontOffers(query);
        return {
            message: 'Active offers retrieved successfully',
            data,
        };
    }
};
__decorate([
    Get(),
    ApiOperation({
        summary: 'Retrieve all active customer-facing offers, products, coupons, and countdown timer',
    }),
    __param(0, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [QueryOffersDto]),
    __metadata("design:returntype", Promise)
], OffersController.prototype, "getStorefrontOffers", null);
OffersController = __decorate([
    ApiTags('Storefront - Offers'),
    Public(),
    Controller('offers'),
    __metadata("design:paramtypes", [OffersService])
], OffersController);
export { OffersController };
//# sourceMappingURL=offers.controller.js.map