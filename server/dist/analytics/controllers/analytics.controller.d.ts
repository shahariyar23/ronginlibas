import type { Request, Response } from 'express';
import { AnalyticsService } from '../services/analytics.service.js';
import { TrackEventsBatchDto, UpdateConsentDto } from '../dto/track-event.dto.js';
interface RequestWithOptionalUser extends Request {
    user?: {
        id: string;
        role: string;
        type: string;
    };
}
export declare class AnalyticsController {
    private readonly analyticsService;
    constructor(analyticsService: AnalyticsService);
    trackEvents(dto: TrackEventsBatchDto, req: RequestWithOptionalUser, res: Response): Promise<{
        success: boolean;
        processed: number;
        consented: boolean;
        visitorToken: string;
    }>;
    updateConsent(dto: UpdateConsentDto, req: RequestWithOptionalUser, res: Response): Promise<{
        success: boolean;
        visitorToken: string;
        analyticsConsent: boolean;
        marketingConsent: boolean;
    }>;
    identify(req: RequestWithOptionalUser, res: Response): Promise<{
        success: boolean;
        message: string;
        visitorToken?: undefined;
        customerId?: undefined;
    } | {
        success: boolean;
        visitorToken: string;
        customerId: string;
        message?: undefined;
    }>;
    getVisitorStatus(req: RequestWithOptionalUser, res: Response): Promise<{
        visitorToken: string;
        customerId: string | null;
        analyticsConsent: boolean;
        marketingConsent: boolean;
    }>;
}
export {};
