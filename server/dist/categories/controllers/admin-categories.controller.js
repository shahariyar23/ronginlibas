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
import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CategoriesService } from '../services/categories.service.js';
import { CreateCategoryDto } from '../dto/create-category.dto.js';
import { UpdateCategoryDto } from '../dto/update-category.dto.js';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Permissions } from '../../common/decorators/permissions.decorator.js';
import { UserRole } from '../../common/constants/roles.constant.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { AuditService } from '../../audit/audit.service.js';
let AdminCategoriesController = class AdminCategoriesController {
    categoriesService;
    auditService;
    constructor(categoriesService, auditService) {
        this.categoriesService = categoriesService;
        this.auditService = auditService;
    }
    async findAll() {
        const data = await this.categoriesService.findAll(true);
        return {
            message: 'Admin categories retrieved successfully',
            data,
        };
    }
    async create(dto, actor) {
        const data = await this.categoriesService.create(dto);
        await this.auditService.record({
            actor,
            module: 'categories',
            action: 'CATEGORY_CREATED',
            entityType: 'category',
            entityId: data.id,
            entityLabel: data.name,
            summary: `Created category ${data.name}`,
            after: data,
        });
        return {
            message: 'Category created successfully',
            data,
        };
    }
    async update(id, dto, actor) {
        const data = await this.categoriesService.update(id, dto);
        await this.auditService.record({
            actor,
            module: 'categories',
            action: 'CATEGORY_UPDATED',
            entityType: 'category',
            entityId: data.id,
            entityLabel: data.name,
            summary: `Updated category ${data.name}`,
            after: data,
        });
        return {
            message: 'Category updated successfully',
            data,
        };
    }
    async delete(id, actor) {
        const result = await this.categoriesService.remove(id);
        await this.auditService.record({
            actor,
            module: 'categories',
            action: 'CATEGORY_DELETED',
            entityType: 'category',
            entityId: id,
            summary: `Deleted category ${id}`,
        });
        return result;
    }
};
__decorate([
    Get(),
    ApiOperation({ summary: 'List all categories with products count' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminCategoriesController.prototype, "findAll", null);
__decorate([
    Post(),
    ApiOperation({ summary: 'Create new apparel category' }),
    __param(0, Body()),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateCategoryDto, Object]),
    __metadata("design:returntype", Promise)
], AdminCategoriesController.prototype, "create", null);
__decorate([
    Put(':id'),
    ApiOperation({ summary: 'Update an existing category' }),
    __param(0, Param('id')),
    __param(1, Body()),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateCategoryDto, Object]),
    __metadata("design:returntype", Promise)
], AdminCategoriesController.prototype, "update", null);
__decorate([
    Delete(':id'),
    ApiOperation({ summary: 'Delete a category' }),
    __param(0, Param('id')),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminCategoriesController.prototype, "delete", null);
AdminCategoriesController = __decorate([
    ApiTags('Admin - Categories'),
    ApiBearerAuth(),
    UseGuards(JwtAuthGuard, RolesGuard),
    Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
    Permissions('categories'),
    Controller('admin/categories'),
    __metadata("design:paramtypes", [CategoriesService,
        AuditService])
], AdminCategoriesController);
export { AdminCategoriesController };
//# sourceMappingURL=admin-categories.controller.js.map