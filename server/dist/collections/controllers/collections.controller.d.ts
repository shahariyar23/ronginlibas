import { CollectionsService } from '../services/collections.service.js';
export declare class CollectionsController {
    private readonly collectionsService;
    constructor(collectionsService: CollectionsService);
    findAll(): Promise<{
        message: string;
        data: ({
            _count: {
                products: number;
            };
        } & {
            description: string | null;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            slug: string;
            seoTitle: string | null;
            metaDescription: string | null;
            sortOrder: number;
            image: string | null;
            tagline: string | null;
        })[];
    }>;
    findBySlug(slug: string): Promise<{
        message: string;
        data: {
            _count: {
                products: number;
            };
            products: {
                id: string;
                name: string;
                slug: string;
                price: import("@prisma/client/runtime/library").Decimal;
                compareAtPrice: import("@prisma/client/runtime/library").Decimal | null;
                sku: string;
                gender: import("@prisma/client").$Enums.Gender;
                isFeatured: boolean;
                isNewArrival: boolean;
                isBestSeller: boolean;
                category: {
                    name: string;
                    slug: string;
                };
                variants: {
                    id: string;
                    size: string;
                    color: string;
                    stock: number;
                }[];
                images: {
                    id: string;
                    url: string;
                    isPrimary: boolean;
                    altText: string | null;
                }[];
            }[];
        } & {
            description: string | null;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            slug: string;
            seoTitle: string | null;
            metaDescription: string | null;
            sortOrder: number;
            image: string | null;
            tagline: string | null;
        };
    }>;
}
