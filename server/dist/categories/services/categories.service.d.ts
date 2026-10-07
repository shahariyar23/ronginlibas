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
        sortOrder: number;
        name: string;
        slug: string;
        id: string;
        image: string | null;
        parentId: string | null;
        children: {
            description: string | null;
            sortOrder: number;
            name: string;
            slug: string;
            id: string;
            image: string | null;
        }[];
        _count: {
            products: number;
        };
    }[]>;
    findBySlug(slug: string): Promise<{
        description: string | null;
        name: string;
        slug: string;
        id: string;
        image: string | null;
        parentId: string | null;
        children: {
            description: string | null;
            name: string;
            slug: string;
            id: string;
            image: string | null;
        }[];
        _count: {
            products: number;
        };
    }>;
    findProductsBySlug(slug: string, query: ProductQueryDto): Promise<import("../../common/dto/pagination-query.dto.js").PaginatedResult<any>>;
    create(dto: CreateCategoryDto): Promise<{
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
    }>;
}
