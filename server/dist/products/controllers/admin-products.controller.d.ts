import { ProductsService } from '../services/products.service.js';
import { CreateProductDto } from '../dto/create-product.dto.js';
import { UpdateProductDto } from '../dto/update-product.dto.js';
import { ProductQueryDto } from '../dto/product-query.dto.js';
export declare class AdminProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    findAll(query: ProductQueryDto): Promise<{
        message: string;
        data: import("../../common/dto/pagination-query.dto.js").PaginatedResult<any>;
    }>;
    findById(id: string): Promise<{
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
    create(dto: CreateProductDto): Promise<{
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
    update(id: string, dto: UpdateProductDto): Promise<{
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
    delete(id: string): Promise<{
        message: string;
        data: {
            message: string;
        };
    }>;
}
