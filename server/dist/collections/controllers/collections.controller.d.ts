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
    findBySlug(slug: string): Promise<{
        message: string;
        data: {
            _count: {
                products: number;
            };
            products: {
                category: {
                    name: string;
                    slug: string;
                };
                name: string;
                price: import("@prisma/client/runtime/library").Decimal;
                id: string;
                slug: string;
                compareAtPrice: import("@prisma/client/runtime/library").Decimal | null;
                sku: string;
                gender: import("@prisma/client").$Enums.Gender;
                isFeatured: boolean;
                isNewArrival: boolean;
                isBestSeller: boolean;
                variants: {
                    size: string;
                    color: string;
                    id: string;
                    stock: number;
                }[];
                images: {
                    url: string;
                    id: string;
                    isPrimary: boolean;
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
}
