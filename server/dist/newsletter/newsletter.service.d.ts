import { PrismaService } from '../prisma/prisma.service.js';
export declare class NewsletterService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    subscribe(email: string): Promise<{
        subscribed: boolean;
    }>;
    unsubscribe(email: string): Promise<{
        unsubscribed: boolean;
    }>;
}
