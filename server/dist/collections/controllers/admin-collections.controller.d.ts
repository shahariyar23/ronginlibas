import { CollectionsService } from '../services/collections.service.js';
import { CreateCollectionDto } from '../dto/create-collection.dto.js';
import { UpdateCollectionDto } from '../dto/update-collection.dto.js';
import { AuditService, type AdminAuditActor } from '../../audit/audit.service.js';
export declare class AdminCollectionsController {
    private readonly collectionsService;
    private readonly auditService;
    constructor(collectionsService: CollectionsService, auditService: AuditService);
    findAll(): Promise<{
        message: string;
        data: ({
            _count: {
                products: number;
            };
        } & {
            description: string | null;
            name: string;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            slug: string;
            seoTitle: string | null;
            metaDescription: string | null;
            sortOrder: number;
            image: string | null;
            tagline: string | null;
        })[];
    }>;
    findById(id: string): Promise<{
        message: string;
        data: {
            _count: {
                products: number;
            };
            products: {
                name: string;
                price: import("@prisma/client/runtime/library").Decimal;
                id: string;
                isActive: boolean;
                slug: string;
                compareAtPrice: import("@prisma/client/runtime/library").Decimal | null;
                sku: string;
                images: {
                    url: string;
                    altText: string | null;
                }[];
            }[];
        } & {
            description: string | null;
            name: string;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            slug: string;
            seoTitle: string | null;
            metaDescription: string | null;
            sortOrder: number;
            image: string | null;
            tagline: string | null;
        };
    }>;
    create(dto: CreateCollectionDto, actor: AdminAuditActor): Promise<{
        message: string;
        data: {
            _count: {
                products: number;
            };
        } & {
            description: string | null;
            name: string;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            slug: string;
            seoTitle: string | null;
            metaDescription: string | null;
            sortOrder: number;
            image: string | null;
            tagline: string | null;
        };
    }>;
    update(id: string, dto: UpdateCollectionDto, actor: AdminAuditActor): Promise<{
        message: string;
        data: {
            _count: {
                products: number;
            };
        } & {
            description: string | null;
            name: string;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            slug: string;
            seoTitle: string | null;
            metaDescription: string | null;
            sortOrder: number;
            image: string | null;
            tagline: string | null;
        };
    }>;
    delete(id: string, actor: AdminAuditActor): Promise<{
        message: string;
        data: {
            description: string | null;
            name: string;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            slug: string;
            seoTitle: string | null;
            metaDescription: string | null;
            sortOrder: number;
            image: string | null;
            tagline: string | null;
        };
    }>;
}
