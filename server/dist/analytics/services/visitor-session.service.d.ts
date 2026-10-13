import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { PrismaService } from '../../prisma/prisma.service.js';
import { UpdateConsentDto } from '../dto/track-event.dto.js';
export declare const VISITOR_COOKIE_NAME = "rl_vid";
export interface ResolvedVisitorContext {
    visitorId: string;
    visitorToken: string;
    sessionId: string;
    customerId: string | null;
    analyticsConsent: boolean;
    marketingConsent: boolean;
    isNewVisitor: boolean;
}
export declare class VisitorSessionService {
    private readonly prisma;
    private readonly configService;
    private readonly logger;
    private readonly isProduction;
    constructor(prisma: PrismaService, configService: ConfigService);
    hashIp(ip?: string): string | undefined;
    resolveVisitorAndSession(req: Request, res?: Response, landingPage?: string, referrer?: string, deviceType?: string, authenticatedCustomerId?: string): Promise<ResolvedVisitorContext>;
    private resolveSession;
    recordConsent(visitorId: string, dto: UpdateConsentDto, ip?: string): Promise<{
        analyticsConsent: boolean;
        marketingConsent: boolean;
        version: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        ipHash: string | null;
        visitorId: string;
    }>;
    getConsent(visitorToken: string): Promise<{
        visitorToken: string;
        analyticsConsent: boolean;
        marketingConsent: boolean;
        updatedAt: Date;
    } | null>;
}
