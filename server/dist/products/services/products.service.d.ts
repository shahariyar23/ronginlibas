import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateProductDto } from '../dto/create-product.dto.js';
import { UpdateProductDto } from '../dto/update-product.dto.js';
import { ProductQueryDto } from '../dto/product-query.dto.js';
import { PaginatedResult } from '../../common/dto/pagination-query.dto.js';
export declare class ProductsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(query: ProductQueryDto, isAdmin?: boolean): Promise<PaginatedResult<any>>;
    findBySlug(slug: string): Promise<({
        category: {
            description: string | null;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            sortOrder: number;
            slug: string;
            image: string | null;
            parentId: string | null;
        };
        reviews: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            customerId: string;
            status: import("@prisma/client").$Enums.ReviewStatus;
            productId: string;
            rating: number;
            comment: string;
        }[];
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
        images: never[];
        variants: never[];
    }>;
    findById(id: string): Promise<({
        category: {
            description: string | null;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            sortOrder: number;
            slug: string;
            image: string | null;
            parentId: string | null;
        };
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
    }>;
    create(dto: CreateProductDto): Promise<({
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
    }>;
    update(id: string, dto: UpdateProductDto): Promise<({
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
    }>;
    delete(id: string): Promise<{
        message: string;
    }>;
}
