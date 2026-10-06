import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateCategoryDto } from '../dto/create-category.dto.js';
export declare class CategoriesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(isAdmin?: boolean): Promise<({
        _count: {
            products: number;
        };
        children: {
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
        }[];
    } & {
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
    })[] | {
        id: string;
        name: string;
        slug: string;
        description: string;
        itemCount: number;
    }[]>;
    findBySlug(slug: string): Promise<({
        children: {
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
        }[];
        products: ({
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
        })[];
    } & {
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
    }) | {
        id: string;
        name: string;
        slug: string;
    }>;
    create(dto: CreateCategoryDto): Promise<{
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
    } | {
        id: string;
        name: string;
        slug: string;
    }>;
}
