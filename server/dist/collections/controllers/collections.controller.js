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
import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CollectionsService } from '../services/collections.service.js';
import { Public } from '../../common/decorators/public.decorator.js';
let CollectionsController = class CollectionsController {
    collectionsService;
    constructor(collectionsService) {
        this.collectionsService = collectionsService;
    }
    async findAll() {
        const data = await this.collectionsService.findAll(false);
        return {
            message: 'Active collections retrieved successfully',
            data,
        };
    }
    async findBySlug(slug) {
        const data = await this.collectionsService.findBySlug(slug, false);
        return {
            message: 'Collection retrieved successfully',
            data,
        };
    }
};
__decorate([
    Get(),
    ApiOperation({ summary: 'Browse active public product collections' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CollectionsController.prototype, "findAll", null);
__decorate([
    Get(':slug'),
    ApiOperation({ summary: 'Retrieve collection details and products by slug' }),
    __param(0, Param('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CollectionsController.prototype, "findBySlug", null);
CollectionsController = __decorate([
    ApiTags('Storefront - Collections'),
    Public(),
    Controller('collections'),
    __metadata("design:paramtypes", [CollectionsService])
], CollectionsController);
export { CollectionsController };
//# sourceMappingURL=collections.controller.js.map