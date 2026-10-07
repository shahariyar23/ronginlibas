import { NewsletterEmailDto } from './dto/newsletter-email.dto.js';
import { NewsletterService } from './newsletter.service.js';
export declare class NewsletterController {
    private readonly newsletterService;
    constructor(newsletterService: NewsletterService);
    subscribe(dto: NewsletterEmailDto): Promise<{
        message: string;
        data: {
            subscribed: boolean;
        };
    }>;
    unsubscribe(dto: NewsletterEmailDto): Promise<{
        message: string;
        data: {
            unsubscribed: boolean;
        };
    }>;
}
