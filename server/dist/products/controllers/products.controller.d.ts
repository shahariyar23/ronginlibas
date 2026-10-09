import { ProductsService } from '../services/products.service.js';
import { ProductQueryDto } from '../dto/product-query.dto.js';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    findAll(query: ProductQueryDto): Promise<{
        message: string;
        data: import("../../common/dto/pagination-query.dto.js").PaginatedResult<any>;
    }>;
    getFilters(query: ProductQueryDto): Promise<{
        message: string;
        data: {
            categories: {
                id: string;
                name: string;
                slug: string;
                count: number;
            }[];
            sizes: {
                value: string;
                type: "APPAREL" | "WAIST" | "CUSTOM";
                count: number;
            }[];
            colors: {
                name: string;
                slug: string;
                count: number;
            }[];
            fabrics: {
                name: string;
                slug: string;
                count: number;
            }[];
            fabricOrigins: {
                name: string;
                slug: string;
                count: number;
            }[];
            fits: {
                name: string;
                slug: string;
                count: number;
            }[];
            price: {
                min: number;
                max: number;
            };
        };
    }>;
    findBySlug(slug: string): Promise<{
        message: string;
        data: {
            category: {
                description: string | null;
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                slug: string;
                sortOrder: number;
                image: string | null;
                parentId: string | null;
            };
            reviews: ({
                customer: {
                    firstName: string;
                    lastName: string | null;
                };
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                customerId: string;
                status: import("@prisma/client").$Enums.ReviewStatus;
                productId: string;
                rating: number;
                comment: string;
                adminFeedback: string | null;
                adminFeedbackAt: Date | null;
            })[];
            variants: {
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                measurements: import("@prisma/client/runtime/library").JsonValue | null;
                sku: string;
                productId: string;
                size: string;
                color: string;
                sizeLabel: string | null;
                sizeType: string | null;
                stock: number;
                priceOverride: import("@prisma/client/runtime/library").Decimal | null;
            }[];
            images: {
                url: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                sortOrder: number;
                isPrimary: boolean;
                productId: string;
                publicId: string | null;
                altText: string | null;
            }[];
        } & {
            description: string | null;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            tags: string[];
            slug: string;
            price: import("@prisma/client/runtime/library").Decimal;
            compareAtPrice: import("@prisma/client/runtime/library").Decimal | null;
            costPrice: import("@prisma/client/runtime/library").Decimal | null;
            sku: string;
            gender: import("@prisma/client").$Enums.Gender;
            fabric: string | null;
            fit: string | null;
            shortDescription: string | null;
            fabricOrigin: string | null;
            gsm: number | null;
            careInstructions: string | null;
            isExpressAvailable: boolean;
            alertThreshold: number;
            deletedAt: Date | null;
            isFeatured: boolean;
            isNewArrival: boolean;
            isBestSeller: boolean;
            categoryId: string;
        };
    }>;
    findRelated(slug: string): Promise<{
        message: string;
        data: ({
            category: {
                id: string;
                name: string;
                slug: string;
            };
            variants: {
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                measurements: import("@prisma/client/runtime/library").JsonValue | null;
                sku: string;
                productId: string;
                size: string;
                color: string;
                sizeLabel: string | null;
                sizeType: string | null;
                stock: number;
                priceOverride: import("@prisma/client/runtime/library").Decimal | null;
            }[];
            images: {
                url: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                sortOrder: number;
                isPrimary: boolean;
                productId: string;
                publicId: string | null;
                altText: string | null;
            }[];
        } & {
            description: string | null;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            tags: string[];
            slug: string;
            price: import("@prisma/client/runtime/library").Decimal;
            compareAtPrice: import("@prisma/client/runtime/library").Decimal | null;
            costPrice: import("@prisma/client/runtime/library").Decimal | null;
            sku: string;
            gender: import("@prisma/client").$Enums.Gender;
            fabric: string | null;
            fit: string | null;
            shortDescription: string | null;
            fabricOrigin: string | null;
            gsm: number | null;
            careInstructions: string | null;
            isExpressAvailable: boolean;
            alertThreshold: number;
            deletedAt: Date | null;
            isFeatured: boolean;
            isNewArrival: boolean;
            isBestSeller: boolean;
            categoryId: string;
        })[];
    }>;
    findRecommendations(slug: string): Promise<{
        message: string;
        data: ({
            category: {
                id: string;
                name: string;
                slug: string;
            };
            variants: {
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                measurements: import("@prisma/client/runtime/library").JsonValue | null;
                sku: string;
                productId: string;
                size: string;
                color: string;
                sizeLabel: string | null;
                sizeType: string | null;
                stock: number;
                priceOverride: import("@prisma/client/runtime/library").Decimal | null;
            }[];
            images: {
                url: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                sortOrder: number;
                isPrimary: boolean;
                productId: string;
                publicId: string | null;
                altText: string | null;
            }[];
        } & {
            description: string | null;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            tags: string[];
            slug: string;
            price: import("@prisma/client/runtime/library").Decimal;
            compareAtPrice: import("@prisma/client/runtime/library").Decimal | null;
            costPrice: import("@prisma/client/runtime/library").Decimal | null;
            sku: string;
            gender: import("@prisma/client").$Enums.Gender;
            fabric: string | null;
            fit: string | null;
            shortDescription: string | null;
            fabricOrigin: string | null;
            gsm: number | null;
            careInstructions: string | null;
            isExpressAvailable: boolean;
            alertThreshold: number;
            deletedAt: Date | null;
            isFeatured: boolean;
            isNewArrival: boolean;
            isBestSeller: boolean;
            categoryId: string;
        })[];
    }>;
}
