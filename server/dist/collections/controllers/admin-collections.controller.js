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
import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CollectionsService } from '../services/collections.service.js';
import { CreateCollectionDto } from '../dto/create-collection.dto.js';
import { UpdateCollectionDto } from '../dto/update-collection.dto.js';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Permissions } from '../../common/decorators/permissions.decorator.js';
import { UserRole } from '../../common/constants/roles.constant.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { AuditService } from '../../audit/audit.service.js';
let AdminCollectionsController = class AdminCollectionsController {
    collectionsService;
    auditService;
    constructor(collectionsService, auditService) {
        this.collectionsService = collectionsService;
        this.auditService = auditService;
    }
    async findAll() {
        const data = await this.collectionsService.findAll(true);
        return {
            message: 'Admin collections retrieved successfully',
            data,
        };
    }
    async findById(id) {
        const data = await this.collectionsService.findById(id);
        return {
            message: 'Collection details retrieved successfully',
            data,
        };
    }
    async create(dto, actor) {
        const data = await this.collectionsService.create(dto);
        await this.auditService.record({
            actor,
            module: 'collections',
            action: 'COLLECTION_CREATED',
            entityType: 'collection',
            entityId: data.id,
            entityLabel: data.name,
            summary: `Created collection "${data.name}"`,
            after: data,
        });
        return {
            message: 'Collection created successfully',
            data,
        };
    }
    async update(id, dto, actor) {
        const before = await this.collectionsService.findById(id).catch(() => null);
        const data = await this.collectionsService.update(id, dto);
        await this.auditService.record({
            actor,
            module: 'collections',
            action: 'COLLECTION_UPDATED',
            entityType: 'collection',
            entityId: data.id,
            entityLabel: data.name,
            summary: `Updated collection "${data.name}"`,
            before,
            after: data,
        });
        return {
            message: 'Collection updated successfully',
            data,
        };
    }
    async delete(id, actor) {
        const before = await this.collectionsService.findById(id).catch(() => null);
        const data = await this.collectionsService.delete(id);
        await this.auditService.record({
            actor,
            module: 'collections',
            action: 'COLLECTION_DELETED',
            entityType: 'collection',
            entityId: id,
            entityLabel: before?.name || id,
            summary: `Deleted collection "${before?.name || id}"`,
            before,
        });
        return {
            message: 'Collection deleted successfully',
            data,
        };
    }
};
__decorate([
    Get(),
    ApiOperation({ summary: 'List all collections with linked products count' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminCollectionsController.prototype, "findAll", null);
__decorate([
    Get(':id'),
    ApiOperation({ summary: 'Retrieve collection details with assigned products' }),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminCollectionsController.prototype, "findById", null);
__decorate([
    Post(),
    ApiOperation({ summary: 'Create new product collection' }),
    __param(0, Body()),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateCollectionDto, Object]),
    __metadata("design:returntype", Promise)
], AdminCollectionsController.prototype, "create", null);
__decorate([
    Patch(':id'),
    ApiOperation({ summary: 'Update collection details and product links' }),
    __param(0, Param('id')),
    __param(1, Body()),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateCollectionDto, Object]),
    __metadata("design:returntype", Promise)
], AdminCollectionsController.prototype, "update", null);
__decorate([
    Delete(':id'),
    ApiOperation({ summary: 'Safe delete collection' }),
    __param(0, Param('id')),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminCollectionsController.prototype, "delete", null);
AdminCollectionsController = __decorate([
    ApiTags('Admin - Collections'),
    ApiBearerAuth(),
    UseGuards(JwtAuthGuard, RolesGuard),
    Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
    Permissions('collections', 'categories', 'products'),
    Controller('admin/collections'),
    __metadata("design:paramtypes", [CollectionsService,
        AuditService])
], AdminCollectionsController);
export { AdminCollectionsController };
//# sourceMappingURL=admin-collections.controller.js.map