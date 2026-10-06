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
    create(dto: CreateProductDto): Promise<{
        message: string;
        data: ({
            variants: {
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                size: string;
                color: string;
                sku: string;
                stock: number;
                priceOverride: import("@prisma/client/runtime/library").Decimal | null;
                productId: string;
            }[];
            images: {
                url: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                altText: string | null;
                sortOrder: number;
                isPrimary: boolean;
                productId: string;
            }[];
        } & {
            description: string | null;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            sku: string;
            slug: string;
            price: import("@prisma/client/runtime/library").Decimal;
            compareAtPrice: import("@prisma/client/runtime/library").Decimal | null;
            costPrice: import("@prisma/client/runtime/library").Decimal | null;
            gender: import("@prisma/client").$Enums.Gender;
            fabric: string | null;
            fit: string | null;
            categoryId: string;
            isFeatured: boolean;
            isNewArrival: boolean;
            isBestSeller: boolean;
        }) | {
            id: string;
            name: string;
            slug: string;
            sku: string;
            price: number;
            variants: import("../dto/create-product.dto.js").CreateVariantDto[];
            images: import("../dto/create-product.dto.js").CreateProductImageDto[];
        };
    }>;
    update(id: string, dto: UpdateProductDto): Promise<{
        message: string;
        data: ({
            variants: {
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                size: string;
                color: string;
                sku: string;
                stock: number;
                priceOverride: import("@prisma/client/runtime/library").Decimal | null;
                productId: string;
            }[];
            images: {
                url: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                altText: string | null;
                sortOrder: number;
                isPrimary: boolean;
                productId: string;
            }[];
        } & {
            description: string | null;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            sku: string;
            slug: string;
            price: import("@prisma/client/runtime/library").Decimal;
            compareAtPrice: import("@prisma/client/runtime/library").Decimal | null;
            costPrice: import("@prisma/client/runtime/library").Decimal | null;
            gender: import("@prisma/client").$Enums.Gender;
            fabric: string | null;
            fit: string | null;
            categoryId: string;
            isFeatured: boolean;
            isNewArrival: boolean;
            isBestSeller: boolean;
        }) | {
            updatedAt: Date;
            id: string;
        };
    }>;
    delete(id: string): Promise<{
        message: string;
        data: {
            message: string;
        };
    }>;
}
