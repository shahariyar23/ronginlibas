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
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator.js';
import { ProductQueryDto } from '../dto/product-query.dto.js';
import { ProductsService } from '../services/products.service.js';
let ProductSearchController = class ProductSearchController {
    productsService;
    constructor(productsService) {
        this.productsService = productsService;
    }
    async searchProducts(query) {
        const data = await this.productsService.findAll(query);
        return { message: 'Product search completed successfully', data };
    }
};
__decorate([
    Get('products'),
    ApiOperation({ summary: 'Search the active product catalogue' }),
    __param(0, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ProductQueryDto]),
    __metadata("design:returntype", Promise)
], ProductSearchController.prototype, "searchProducts", null);
ProductSearchController = __decorate([
    ApiTags('Products'),
    Public(),
    Controller('search'),
    __metadata("design:paramtypes", [ProductsService])
], ProductSearchController);
export { ProductSearchController };
//# sourceMappingURL=product-search.controller.js.map