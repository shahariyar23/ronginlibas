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
import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProductsService } from '../services/products.service.js';
import { CreateProductDto } from '../dto/create-product.dto.js';
import { UpdateProductDto } from '../dto/update-product.dto.js';
import { ProductQueryDto } from '../dto/product-query.dto.js';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { UserRole } from '../../common/constants/roles.constant.js';
let AdminProductsController = class AdminProductsController {
    productsService;
    constructor(productsService) {
        this.productsService = productsService;
    }
    async findAll(query) {
        const data = await this.productsService.findAll(query, true);
        return {
            message: 'Admin products retrieved successfully',
            data,
        };
    }
    async findById(id) {
        const data = await this.productsService.findById(id);
        return {
            message: 'Product specifications retrieved successfully',
            data,
        };
    }
    async create(dto) {
        const data = await this.productsService.create(dto);
        return {
            message: 'Product created successfully',
            data,
        };
    }
    async update(id, dto) {
        const data = await this.productsService.update(id, dto);
        return {
            message: 'Product updated successfully',
            data,
        };
    }
    async delete(id) {
        const data = await this.productsService.delete(id);
        return {
            message: data.message || 'Product permanently deleted from database',
            data,
        };
    }
};
__decorate([
    Get(),
    ApiOperation({ summary: 'List all products with admin filters, stock states, and SKUs' }),
    __param(0, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ProductQueryDto]),
    __metadata("design:returntype", Promise)
], AdminProductsController.prototype, "findAll", null);
__decorate([
    Get(':id'),
    ApiOperation({ summary: 'Retrieve full garment specifications and variant matrix by ID or slug' }),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminProductsController.prototype, "findById", null);
__decorate([
    Post(),
    ApiOperation({ summary: 'Create new garment silhouette with variants and lookbook media' }),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateProductDto]),
    __metadata("design:returntype", Promise)
], AdminProductsController.prototype, "create", null);
__decorate([
    Patch(':id'),
    ApiOperation({ summary: 'Update product specifications or variants' }),
    __param(0, Param('id')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateProductDto]),
    __metadata("design:returntype", Promise)
], AdminProductsController.prototype, "update", null);
__decorate([
    Delete(':id'),
    ApiOperation({ summary: 'Permanently remove product from database' }),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminProductsController.prototype, "delete", null);
AdminProductsController = __decorate([
    ApiTags('Admin - Products'),
    ApiBearerAuth(),
    UseGuards(JwtAuthGuard, RolesGuard),
    Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
    Controller('admin/products'),
    __metadata("design:paramtypes", [ProductsService])
], AdminProductsController);
export { AdminProductsController };
//# sourceMappingURL=admin-products.controller.js.map