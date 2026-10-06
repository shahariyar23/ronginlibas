import { CategoriesService } from '../services/categories.service.js';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    findAll(): Promise<{
        message: string;
        data: ({
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
        }[];
    }>;
    findBySlug(slug: string): Promise<{
        message: string;
        data: ({
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
        };
    }>;
}
