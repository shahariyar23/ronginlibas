import { CategoriesService } from '../services/categories.service.js';
import { CreateCategoryDto } from '../dto/create-category.dto.js';
import { AuditService, type AdminAuditActor } from '../../audit/audit.service.js';
export declare class AdminCategoriesController {
    private readonly categoriesService;
    private readonly auditService;
    constructor(categoriesService: CategoriesService, auditService: AuditService);
    findAll(): Promise<{
        message: string;
        data: {
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
        }[];
    }>;
    create(dto: CreateCategoryDto, actor: AdminAuditActor): Promise<{
        message: string;
        data: {
            description: string | null;
            name: string;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            slug: string;
            sortOrder: number;
            image: string | null;
            parentId: string | null;
        };
    }>;
}
