import { CloudinaryService } from '../services/cloudinary.service.js';
export declare class AdminProductImagesController {
    private readonly cloudinary;
    constructor(cloudinary: CloudinaryService);
    upload(file?: Express.Multer.File): Promise<{
        message: string;
        data: {
            url: string;
            publicId: string;
        };
    }>;
    destroy(_unused?: Express.Multer.File): Promise<void>;
}
