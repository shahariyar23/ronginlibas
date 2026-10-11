import { CategoriesService } from '../services/categories.service.js';
import { CreateCategoryDto } from '../dto/create-category.dto.js';
export declare class AdminCategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    findAll(): Promise<{
        message: string;
        data: {
            description: string | null;
            id: string;
            name: string;
            _count: {
                products: number;
            };
            slug: string;
            sortOrder: number;
            image: string | null;
            parentId: string | null;
            children: {
                description: string | null;
                id: string;
                name: string;
                slug: string;
                sortOrder: number;
                image: string | null;
            }[];
        }[];
    }>;
    create(dto: CreateCategoryDto): Promise<{
        message: string;
        data: {
            description: string | null;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            slug: string;
            seoTitle: string | null;
            metaDescription: string | null;
            sortOrder: number;
            image: string | null;
            parentId: string | null;
        };
    }>;
}
