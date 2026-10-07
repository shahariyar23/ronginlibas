import { CategoriesService } from '../services/categories.service.js';
import { CreateCategoryDto } from '../dto/create-category.dto.js';
export declare class AdminCategoriesController {
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
    create(dto: CreateCategoryDto): Promise<{
        message: string;
        data: {
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
    }>;
}
