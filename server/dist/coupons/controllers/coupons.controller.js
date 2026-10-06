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
import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CouponsService } from '../services/coupons.service.js';
import { Public } from '../../common/decorators/public.decorator.js';
let CouponsController = class CouponsController {
    couponsService;
    constructor(couponsService) {
        this.couponsService = couponsService;
    }
    async validate(body) {
        const data = await this.couponsService.validateCoupon(body.code, body.cartTotal);
        return {
            message: 'Voucher applied successfully',
            data,
        };
    }
};
__decorate([
    Post('validate'),
    ApiOperation({ summary: 'Validate discount voucher code against cart total' }),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CouponsController.prototype, "validate", null);
CouponsController = __decorate([
    ApiTags('Storefront - Coupons'),
    Public(),
    Controller('coupons'),
    __metadata("design:paramtypes", [CouponsService])
], CouponsController);
export { CouponsController };
//# sourceMappingURL=coupons.controller.js.map