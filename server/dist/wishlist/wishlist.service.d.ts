import { PrismaService } from '../prisma/prisma.service.js';
export declare class WishlistService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(customerId: string): Promise<{
        createdAt: Date;
        product: {
            price: number;
            compareAtPrice: number | null;
            category: {
                name: string;
                slug: string;
            };
            name: string;
            id: string;
            slug: string;
            shortDescription: string | null;
            images: {
                url: string;
                isPrimary: boolean;
                altText: string | null;
            }[];
        };
    }[]>;
    add(customerId: string, productId: string): Promise<{
        added: boolean;
    }>;
    remove(customerId: string, productId: string): Promise<{
        removed: boolean;
    }>;
}
