import { CategoriesService } from '../services/categories.service.js';
import { CreateCategoryDto } from '../dto/create-category.dto.js';
import { UpdateCategoryDto } from '../dto/update-category.dto.js';
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
            createdAt: Date;
            id: string;
            updatedAt: Date;
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
            createdAt: Date;
            id: string;
            isActive: boolean;
            updatedAt: Date;
            slug: string;
            seoTitle: string | null;
            metaDescription: string | null;
            sortOrder: number;
            image: string | null;
            parentId: string | null;
        };
    }>;
    update(id: string, dto: UpdateCategoryDto, actor: AdminAuditActor): Promise<{
        message: string;
        data: {
            description: string | null;
            name: string;
            createdAt: Date;
            id: string;
            isActive: boolean;
            updatedAt: Date;
            slug: string;
            seoTitle: string | null;
            metaDescription: string | null;
            sortOrder: number;
            image: string | null;
            parentId: string | null;
        };
    }>;
    delete(id: string, actor: AdminAuditActor): Promise<{
        success: boolean;
        message: string;
    }>;
}
