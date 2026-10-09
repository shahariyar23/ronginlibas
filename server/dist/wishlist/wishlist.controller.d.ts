import { WishlistService } from './wishlist.service.js';
export declare class WishlistController {
    private readonly wishlistService;
    constructor(wishlistService: WishlistService);
    findAll(customerId: string): Promise<{
        message: string;
        data: {
            createdAt: Date;
            product: {
                price: number;
                compareAtPrice: number | null;
                category: {
                    name: string;
                    slug: string;
                };
                id: string;
                name: string;
                slug: string;
                shortDescription: string | null;
                images: {
                    url: string;
                    isPrimary: boolean;
                    altText: string | null;
                }[];
            };
        }[];
    }>;
    add(customerId: string, productId: string): Promise<{
        message: string;
        data: {
            added: boolean;
        };
    }>;
    remove(customerId: string, productId: string): Promise<{
        message: string;
        data: {
            removed: boolean;
        };
    }>;
}
