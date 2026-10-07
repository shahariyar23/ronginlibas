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
import { CategoriesService } from '../services/categories.service.js';
import { Public } from '../../common/decorators/public.decorator.js';
import { ProductQueryDto } from '../../products/dto/product-query.dto.js';
let CategoriesController = class CategoriesController {
    categoriesService;
    constructor(categoriesService) {
        this.categoriesService = categoriesService;
    }
    async findAll() {
        const data = await this.categoriesService.findAll(false);
        return {
            message: 'Categories retrieved successfully',
            data,
        };
    }
    async findProducts(slug, query) {
        const data = await this.categoriesService.findProductsBySlug(slug, query);
        return { message: 'Category products retrieved successfully', data };
    }
    async findBySlug(slug) {
        const data = await this.categoriesService.findBySlug(slug);
        return {
            message: 'Category retrieved successfully',
            data,
        };
    }
};
__decorate([
    Get(),
    ApiOperation({ summary: 'List all active apparel categories and capsules' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CategoriesController.prototype, "findAll", null);
__decorate([
    Get(':slug/products'),
    ApiOperation({ summary: 'List active products in a category' }),
    __param(0, Param('slug')),
    __param(1, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, ProductQueryDto]),
    __metadata("design:returntype", Promise)
], CategoriesController.prototype, "findProducts", null);
__decorate([
    Get(':slug'),
    ApiOperation({ summary: 'Retrieve category details and featured silhouettes' }),
    __param(0, Param('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CategoriesController.prototype, "findBySlug", null);
CategoriesController = __decorate([
    ApiTags('Storefront - Categories'),
    Public(),
    Controller('categories'),
    __metadata("design:paramtypes", [CategoriesService])
], CategoriesController);
export { CategoriesController };
//# sourceMappingURL=categories.controller.js.map