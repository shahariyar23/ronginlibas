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
import { Permissions } from '../../common/decorators/permissions.decorator.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { AuditService } from '../../audit/audit.service.js';
let AdminProductsController = class AdminProductsController {
    productsService;
    auditService;
    constructor(productsService, auditService) {
        this.productsService = productsService;
        this.auditService = auditService;
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
    async create(dto, actor) {
        const data = await this.productsService.create(dto);
        await this.auditService.record({
            actor,
            module: 'products',
            action: 'PRODUCT_CREATED',
            entityType: 'product',
            entityId: data.id,
            entityLabel: data.name,
            summary: `Created product ${data.name}`,
            after: productAuditSnapshot(data),
        });
        return {
            message: 'Product created successfully',
            data,
        };
    }
    async update(id, dto, actor) {
        const before = await this.productsService.findById(id);
        const data = await this.productsService.update(id, dto);
        await this.auditService.record({
            actor,
            module: 'products',
            action: 'PRODUCT_UPDATED',
            entityType: 'product',
            entityId: data.id,
            entityLabel: data.name,
            summary: `Updated product ${data.name}`,
            before: productAuditSnapshot(before),
            after: productAuditSnapshot(data),
        });
        return {
            message: 'Product updated successfully',
            data,
        };
    }
    async archive(id, actor) {
        const before = await this.productsService.findById(id);
        const res = await this.productsService.archive(id);
        await this.auditService.record({
            actor,
            module: 'products',
            action: 'PRODUCT_ARCHIVED',
            entityType: 'product',
            entityId: before.id,
            entityLabel: before.name,
            summary: `Archived product ${before.name}`,
            before: productAuditSnapshot(before),
            after: res.data,
        });
        return {
            message: res.message,
            data: res.data,
        };
    }
    async restore(id, actor) {
        const before = await this.productsService.findById(id);
        const res = await this.productsService.restore(id);
        await this.auditService.record({
            actor,
            module: 'products',
            action: 'PRODUCT_RESTORED',
            entityType: 'product',
            entityId: before.id,
            entityLabel: before.name,
            summary: `Restored product ${before.name}`,
            before: productAuditSnapshot(before),
            after: res.data,
        });
        return {
            message: res.message,
            data: res.data,
        };
    }
    async deletePermanent(id, actor) {
        const before = await this.productsService.findById(id);
        const res = await this.productsService.delete(id);
        await this.auditService.record({
            actor,
            module: 'products',
            action: 'PRODUCT_DELETED',
            entityType: 'product',
            entityId: before.id,
            entityLabel: before.name,
            summary: `Permanently deleted product ${before.name}`,
            before: productAuditSnapshot(before),
        });
        return {
            message: res.message,
            data: res.data,
        };
    }
    async delete(id, actor) {
        const before = await this.productsService.findById(id);
        const res = await this.productsService.delete(id);
        await this.auditService.record({
            actor,
            module: 'products',
            action: 'PRODUCT_DELETED',
            entityType: 'product',
            entityId: before.id,
            entityLabel: before.name,
            summary: `Permanently deleted product ${before.name}`,
            before: productAuditSnapshot(before),
        });
        return {
            message: res.message,
            data: res.data,
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
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateProductDto, Object]),
    __metadata("design:returntype", Promise)
], AdminProductsController.prototype, "create", null);
__decorate([
    Patch(':id'),
    ApiOperation({ summary: 'Update product specifications or variants' }),
    __param(0, Param('id')),
    __param(1, Body()),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateProductDto, Object]),
    __metadata("design:returntype", Promise)
], AdminProductsController.prototype, "update", null);
__decorate([
    Patch(':id/archive'),
    ApiOperation({ summary: 'Archive product (hide from customer storefront, preserve inventory & media)' }),
    __param(0, Param('id')),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminProductsController.prototype, "archive", null);
__decorate([
    Patch(':id/restore'),
    ApiOperation({ summary: 'Restore an archived product to active catalog' }),
    __param(0, Param('id')),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminProductsController.prototype, "restore", null);
__decorate([
    Delete(':id/permanent'),
    ApiOperation({ summary: 'Permanently remove product from database and cleanup Cloudinary media assets' }),
    __param(0, Param('id')),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminProductsController.prototype, "deletePermanent", null);
__decorate([
    Delete(':id'),
    ApiOperation({ summary: 'Permanently remove product from database and cleanup Cloudinary media assets' }),
    __param(0, Param('id')),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminProductsController.prototype, "delete", null);
AdminProductsController = __decorate([
    ApiTags('Admin - Products'),
    ApiBearerAuth(),
    UseGuards(JwtAuthGuard, RolesGuard),
    Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
    Permissions('products'),
    Controller('admin/products'),
    __metadata("design:paramtypes", [ProductsService,
        AuditService])
], AdminProductsController);
export { AdminProductsController };
function productAuditSnapshot(product) {
    return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        costPrice: product.costPrice,
        categoryId: product.categoryId,
        isActive: product.isActive,
        isFeatured: product.isFeatured,
        isNewArrival: product.isNewArrival,
        isBestSeller: product.isBestSeller,
        deletedAt: product.deletedAt,
        variants: product.variants?.map((variant) => ({
            sku: variant.sku,
            size: variant.size,
            sizeLabel: variant.sizeLabel,
            color: variant.color,
            stock: variant.stock,
            priceOverride: variant.priceOverride,
            isActive: variant.isActive,
        })),
        images: product.images?.map((image) => ({
            url: image.url,
            publicId: image.publicId,
            sortOrder: image.sortOrder,
            isPrimary: image.isPrimary,
        })),
    };
}
//# sourceMappingURL=admin-products.controller.js.map