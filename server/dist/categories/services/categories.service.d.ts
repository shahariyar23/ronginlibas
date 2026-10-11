import { PrismaService } from '../../prisma/prisma.service.js';
import { ProductsService } from '../../products/services/products.service.js';
import { ProductQueryDto } from '../../products/dto/product-query.dto.js';
import { CreateCategoryDto } from '../dto/create-category.dto.js';
export declare class CategoriesService {
    private readonly prisma;
    private readonly productsService;
    constructor(prisma: PrismaService, productsService: ProductsService);
    findAll(isAdmin?: boolean): Promise<{
        description: string | null;
        name: string;
        id: string;
        _count: {
            products: number;
        };
        slug: string;
        sortOrder: number;
        image: string | null;
        parentId: string | null;
        children: {
            description: string | null;
            name: string;
            id: string;
            slug: string;
            sortOrder: number;
            image: string | null;
        }[];
    }[]>;
    findBySlug(slug: string): Promise<{
        description: string | null;
        name: string;
        id: string;
        _count: {
            products: number;
        };
        slug: string;
        image: string | null;
        parentId: string | null;
        children: {
            description: string | null;
            name: string;
            id: string;
            slug: string;
            image: string | null;
        }[];
    }>;
    findProductsBySlug(slug: string, query: ProductQueryDto): Promise<import("../../common/dto/pagination-query.dto.js").PaginatedResult<any>>;
    create(dto: CreateCategoryDto): Promise<{
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
        parentId: string | null;
    }>;
}
