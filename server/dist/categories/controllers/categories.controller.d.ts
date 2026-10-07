import { CategoriesService } from '../services/categories.service.js';
import { ProductQueryDto } from '../../products/dto/product-query.dto.js';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    findAll(): Promise<{
        message: string;
        data: {
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
        }[];
    }>;
    findProducts(slug: string, query: ProductQueryDto): Promise<{
        message: string;
        data: import("../../common/dto/pagination-query.dto.js").PaginatedResult<any>;
    }>;
    findBySlug(slug: string): Promise<{
        message: string;
        data: {
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
        };
    }>;
}
