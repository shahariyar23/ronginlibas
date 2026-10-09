var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable, InternalServerErrorException, ServiceUnavailableException, } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
const PRODUCT_IMAGE_FOLDER = 'rongin-libas/products';
const REVIEW_IMAGE_FOLDER = 'rongin-libas/reviews';
let CloudinaryService = class CloudinaryService {
    config;
    constructor(config) {
        this.config = config;
    }
    async uploadProductImage(buffer) {
        this.configure();
        return new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream({ folder: PRODUCT_IMAGE_FOLDER, resource_type: 'image' }, (error, result) => {
                if (error) {
                    reject(new ServiceUnavailableException('Cloudinary image upload failed'));
                    return;
                }
                if (!result?.secure_url || !result.public_id) {
                    reject(new InternalServerErrorException('Cloudinary returned an incomplete image result'));
                    return;
                }
                resolve({ secure_url: result.secure_url, public_id: result.public_id });
            });
            stream.end(buffer);
        });
    }
    async uploadReviewImage(buffer) {
        this.configure();
        return new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream({ folder: REVIEW_IMAGE_FOLDER, resource_type: 'image' }, (error, result) => {
                if (error) {
                    reject(new ServiceUnavailableException('Cloudinary review image upload failed'));
                    return;
                }
                if (!result?.secure_url || !result.public_id) {
                    reject(new InternalServerErrorException('Cloudinary returned an incomplete image result'));
                    return;
                }
                resolve({ secure_url: result.secure_url, public_id: result.public_id });
            });
            stream.end(buffer);
        });
    }
    async destroyProductImage(publicId) {
        if (!publicId.startsWith(`${PRODUCT_IMAGE_FOLDER}/`)) {
            throw new InternalServerErrorException('Refusing to delete an image outside the product image folder');
        }
        this.configure();
        try {
            const result = await cloudinary.uploader.destroy(publicId, {
                invalidate: true,
                resource_type: 'image',
            });
            if (result.result !== 'ok' && result.result !== 'not found') {
                throw new ServiceUnavailableException('Cloudinary did not confirm image deletion');
            }
        }
        catch (error) {
            if (error instanceof ServiceUnavailableException)
                throw error;
            throw new ServiceUnavailableException('Cloudinary image deletion failed');
        }
    }
    configure() {
        const cloudName = this.config.get('CLOUDINARY_CLOUD_NAME');
        const apiKey = this.config.get('CLOUDINARY_API_KEY');
        const apiSecret = this.config.get('CLOUDINARY_API_SECRET');
        if (!cloudName || !apiKey || !apiSecret) {
            throw new ServiceUnavailableException('Cloudinary is not configured on the server');
        }
        cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });
    }
};
CloudinaryService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [ConfigService])
], CloudinaryService);
export { CloudinaryService };
//# sourceMappingURL=cloudinary.service.js.map