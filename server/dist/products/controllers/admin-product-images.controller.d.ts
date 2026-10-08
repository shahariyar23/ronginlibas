import { CloudinaryService } from '../services/cloudinary.service.js';
declare class DeleteProductImageDto {
    publicId: string;
}
export declare class AdminProductImagesController {
    private readonly cloudinary;
    constructor(cloudinary: CloudinaryService);
    upload(file?: {
        buffer: Buffer;
        mimetype: string;
    }): Promise<{
        message: string;
        data: {
            url: string;
            publicId: string;
        };
    }>;
    destroy(dto: DeleteProductImageDto): Promise<{
        message: string;
    }>;
}
export {};
