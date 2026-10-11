import { OnModuleInit } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateCollectionDto } from '../dto/create-collection.dto.js';
import { UpdateCollectionDto } from '../dto/update-collection.dto.js';
export declare class CollectionsService implements OnModuleInit {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    onModuleInit(): Promise<void>;
    findAll(isAdmin?: boolean): Promise<({
        _count: {
            products: number;
        };
    } & {
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
        tagline: string | null;
    })[]>;
    findById(id: string): Promise<{
        _count: {
            products: number;
        };
        products: {
            name: string;
            id: string;
            isActive: boolean;
            slug: string;
            price: Prisma.Decimal;
            compareAtPrice: Prisma.Decimal | null;
            sku: string;
            images: {
                url: string;
                altText: string | null;
            }[];
        }[];
    } & {
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
        tagline: string | null;
    }>;
    findBySlug(slug: string, isAdmin?: boolean): Promise<{
        _count: {
            products: number;
        };
        products: {
            category: {
                name: string;
                slug: string;
            };
            name: string;
            id: string;
            slug: string;
            price: Prisma.Decimal;
            compareAtPrice: Prisma.Decimal | null;
            sku: string;
            gender: import("@prisma/client").$Enums.Gender;
            isFeatured: boolean;
            isNewArrival: boolean;
            isBestSeller: boolean;
            variants: {
                id: string;
                size: string;
                color: string;
                stock: number;
            }[];
            images: {
                url: string;
                id: string;
                isPrimary: boolean;
                altText: string | null;
            }[];
        }[];
    } & {
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
        tagline: string | null;
    }>;
    create(dto: CreateCollectionDto): Promise<{
        _count: {
            products: number;
        };
    } & {
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
        tagline: string | null;
    }>;
    update(id: string, dto: UpdateCollectionDto): Promise<{
        _count: {
            products: number;
        };
    } & {
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
        tagline: string | null;
    }>;
    delete(id: string): Promise<{
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
        tagline: string | null;
    }>;
    private seedDefaultsIfEmpty;
}
