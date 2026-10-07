import { ProductsService } from '../services/products.service.js';
import { ProductQueryDto } from '../dto/product-query.dto.js';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    findAll(query: ProductQueryDto): Promise<{
        message: string;
        data: import("../../common/dto/pagination-query.dto.js").PaginatedResult<any>;
    }>;
    findBySlug(slug: string): Promise<{
        message: string;
        data: {
            variants: {
                size: string;
                sizeLabel: string | null;
                color: string;
                sku: string;
                stock: number;
                priceOverride: import("@prisma/client/runtime/library").Decimal | null;
                measurements: import("@prisma/client/runtime/library").JsonValue | null;
                isActive: boolean;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                productId: string;
            }[];
            images: {
                url: string;
                altText: string | null;
                sortOrder: number;
                isPrimary: boolean;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                productId: string;
            }[];
            category: {
                description: string | null;
                sortOrder: number;
                name: string;
                slug: string;
                isActive: boolean;
                id: string;
                image: string | null;
                parentId: string | null;
                createdAt: Date;
                updatedAt: Date;
            };
            reviews: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                productId: string;
                status: import("@prisma/client").$Enums.ReviewStatus;
                customerId: string;
                rating: number;
                comment: string;
            }[];
        } & {
            description: string | null;
            sku: string;
            name: string;
            slug: string;
            shortDescription: string | null;
            price: import("@prisma/client/runtime/library").Decimal;
            compareAtPrice: import("@prisma/client/runtime/library").Decimal | null;
            costPrice: import("@prisma/client/runtime/library").Decimal | null;
            gender: import("@prisma/client").$Enums.Gender;
            fabric: string | null;
            fabricOrigin: string | null;
            fit: string | null;
            gsm: number | null;
            careInstructions: string | null;
            tags: string[];
            isExpressAvailable: boolean;
            categoryId: string;
            isActive: boolean;
            isFeatured: boolean;
            isNewArrival: boolean;
            isBestSeller: boolean;
            id: string;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    findRelated(slug: string): Promise<{
        message: string;
        data: ({
            variants: {
                size: string;
                sizeLabel: string | null;
                color: string;
                sku: string;
                stock: number;
                priceOverride: import("@prisma/client/runtime/library").Decimal | null;
                measurements: import("@prisma/client/runtime/library").JsonValue | null;
                isActive: boolean;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                productId: string;
            }[];
            images: {
                url: string;
                altText: string | null;
                sortOrder: number;
                isPrimary: boolean;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                productId: string;
            }[];
            category: {
                name: string;
                slug: string;
                id: string;
            };
        } & {
            description: string | null;
            sku: string;
            name: string;
            slug: string;
            shortDescription: string | null;
            price: import("@prisma/client/runtime/library").Decimal;
            compareAtPrice: import("@prisma/client/runtime/library").Decimal | null;
            costPrice: import("@prisma/client/runtime/library").Decimal | null;
            gender: import("@prisma/client").$Enums.Gender;
            fabric: string | null;
            fabricOrigin: string | null;
            fit: string | null;
            gsm: number | null;
            careInstructions: string | null;
            tags: string[];
            isExpressAvailable: boolean;
            categoryId: string;
            isActive: boolean;
            isFeatured: boolean;
            isNewArrival: boolean;
            isBestSeller: boolean;
            id: string;
            createdAt: Date;
            updatedAt: Date;
        })[];
    }>;
    findRecommendations(slug: string): Promise<{
        message: string;
        data: ({
            variants: {
                size: string;
                sizeLabel: string | null;
                color: string;
                sku: string;
                stock: number;
                priceOverride: import("@prisma/client/runtime/library").Decimal | null;
                measurements: import("@prisma/client/runtime/library").JsonValue | null;
                isActive: boolean;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                productId: string;
            }[];
            images: {
                url: string;
                altText: string | null;
                sortOrder: number;
                isPrimary: boolean;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                productId: string;
            }[];
            category: {
                name: string;
                slug: string;
                id: string;
            };
        } & {
            description: string | null;
            sku: string;
            name: string;
            slug: string;
            shortDescription: string | null;
            price: import("@prisma/client/runtime/library").Decimal;
            compareAtPrice: import("@prisma/client/runtime/library").Decimal | null;
            costPrice: import("@prisma/client/runtime/library").Decimal | null;
            gender: import("@prisma/client").$Enums.Gender;
            fabric: string | null;
            fabricOrigin: string | null;
            fit: string | null;
            gsm: number | null;
            careInstructions: string | null;
            tags: string[];
            isExpressAvailable: boolean;
            categoryId: string;
            isActive: boolean;
            isFeatured: boolean;
            isNewArrival: boolean;
            isBestSeller: boolean;
            id: string;
            createdAt: Date;
            updatedAt: Date;
        })[];
    }>;
}
