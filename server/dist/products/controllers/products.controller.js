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
import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ProductsService } from '../services/products.service.js';
import { ProductQueryDto } from '../dto/product-query.dto.js';
import { Public } from '../../common/decorators/public.decorator.js';
let ProductsController = class ProductsController {
    productsService;
    constructor(productsService) {
        this.productsService = productsService;
    }
    async findAll(query) {
        const data = await this.productsService.findAll(query, false);
        return {
            message: 'Catalogue retrieved successfully',
            data,
        };
    }
    async getFilters(query) {
        return {
            message: 'Product filters retrieved successfully',
            data: await this.productsService.getFilters(query),
        };
    }
    async findBySlug(slug) {
        const data = await this.productsService.findBySlug(slug);
        const isRedirect = Boolean(data?.isRedirect);
        const redirectTargetSlug = data?.redirectTargetSlug;
        return {
            message: isRedirect ? 'Garment relocated' : 'Garment retrieved successfully',
            data,
            redirect: isRedirect,
            redirectTargetSlug,
        };
    }
    async findRelated(slug) {
        return {
            message: 'Related products retrieved successfully',
            data: await this.productsService.findRelated(slug, 'RELATED'),
        };
    }
};
__decorate([
    Get(),
    ApiOperation({ summary: 'Browse active luxury apparel catalogue' }),
    __param(0, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ProductQueryDto]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "findAll", null);
__decorate([
    Get('filters'),
    ApiOperation({ summary: 'Retrieve dynamic filters for the active product catalogue' }),
    __param(0, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ProductQueryDto]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "getFilters", null);
__decorate([
    Get(':slug'),
    ApiOperation({ summary: 'Retrieve garment product details by slug' }),
    __param(0, Param('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "findBySlug", null);
__decorate([
    Get(':slug/related'),
    ApiOperation({ summary: 'Retrieve related active products' }),
    __param(0, Param('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "findRelated", null);
ProductsController = __decorate([
    ApiTags('Storefront - Products'),
    Public(),
    Controller('products'),
    __metadata("design:paramtypes", [ProductsService])
], ProductsController);
export { ProductsController };
//# sourceMappingURL=products.controller.js.map