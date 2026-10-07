import { ConfigService } from '@nestjs/config';
import { type UploadApiResponse } from 'cloudinary';
export declare class CloudinaryService {
    private readonly config;
    constructor(config: ConfigService);
    uploadProductImage(buffer: Buffer): Promise<Pick<UploadApiResponse, 'secure_url' | 'public_id'>>;
    destroyProductImage(publicId: string): Promise<void>;
    private configure;
}
