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
import { BadRequestException, Body, Controller, Delete, Post, UploadedFile, UseGuards, UseInterceptors, } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { UserRole } from '../../common/constants/roles.constant.js';
import { CloudinaryService } from '../services/cloudinary.service.js';
class DeleteProductImageDto {
    publicId;
}
__decorate([
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], DeleteProductImageDto.prototype, "publicId", void 0);
let AdminProductImagesController = class AdminProductImagesController {
    cloudinary;
    constructor(cloudinary) {
        this.cloudinary = cloudinary;
    }
    async upload(file) {
        if (!file)
            throw new BadRequestException('An image file is required');
        const uploaded = await this.cloudinary.uploadProductImage(file.buffer);
        return {
            message: 'Product image uploaded successfully',
            data: { url: uploaded.secure_url, publicId: uploaded.public_id },
        };
    }
    async destroy(dto) {
        await this.cloudinary.destroyProductImage(dto.publicId);
        return { message: 'Product image deleted successfully' };
    }
};
__decorate([
    Post('upload'),
    ApiConsumes('multipart/form-data'),
    ApiBody({
        schema: {
            type: 'object',
            required: ['file'],
            properties: { file: { type: 'string', format: 'binary' } },
        },
    }),
    ApiOperation({ summary: 'Upload a product image to Cloudinary' }),
    UseInterceptors(FileInterceptor('file', {
        limits: { fileSize: 15 * 1024 * 1024 },
        fileFilter: (_request, file, callback) => {
            if (!['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(file.mimetype)) {
                callback(new BadRequestException('Only JPEG, PNG, WEBP, and AVIF images are allowed'), false);
                return;
            }
            callback(null, true);
        },
    })),
    __param(0, UploadedFile()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminProductImagesController.prototype, "upload", null);
__decorate([
    Delete('cleanup'),
    ApiBody({ type: DeleteProductImageDto }),
    ApiOperation({ summary: 'Delete an unassociated product image from Cloudinary' }),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [DeleteProductImageDto]),
    __metadata("design:returntype", Promise)
], AdminProductImagesController.prototype, "destroy", null);
AdminProductImagesController = __decorate([
    ApiTags('Admin - Product Images'),
    ApiBearerAuth(),
    UseGuards(JwtAuthGuard, RolesGuard),
    Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
    Controller('admin/products/images'),
    __metadata("design:paramtypes", [CloudinaryService])
], AdminProductImagesController);
export { AdminProductImagesController };
//# sourceMappingURL=admin-product-images.controller.js.map