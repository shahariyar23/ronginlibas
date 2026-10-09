import { CloudinaryService } from '../services/cloudinary.service.js';
declare class DeleteProductImageDto {
    publicId: string;
}
import { AuditService, AdminAuditActor } from '../../audit/audit.service.js';
export declare class AdminProductImagesController {
    private readonly cloudinary;
    private readonly auditService;
    constructor(cloudinary: CloudinaryService, auditService: AuditService);
    upload(file?: {
        buffer: Buffer;
        mimetype: string;
    }, actor?: AdminAuditActor): Promise<{
        message: string;
        data: {
            url: string;
            publicId: string;
        };
    }>;
    destroy(dto: DeleteProductImageDto, actor: AdminAuditActor): Promise<{
        message: string;
    }>;
}
export {};
