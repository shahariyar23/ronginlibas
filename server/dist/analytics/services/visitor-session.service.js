var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var VisitorSessionService_1;
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID, createHash } from 'node:crypto';
import { PrismaService } from '../../prisma/prisma.service.js';
export const VISITOR_COOKIE_NAME = 'rl_vid';
const SESSION_INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000;
let VisitorSessionService = VisitorSessionService_1 = class VisitorSessionService {
    prisma;
    configService;
    logger = new Logger(VisitorSessionService_1.name);
    isProduction;
    constructor(prisma, configService) {
        this.prisma = prisma;
        this.configService = configService;
        this.isProduction = this.configService.get('NODE_ENV') === 'production';
    }
    hashIp(ip) {
        if (!ip)
            return undefined;
        return createHash('sha256').update(ip).digest('hex').substring(0, 32);
    }
    async resolveVisitorAndSession(req, res, landingPage, referrer, deviceType, authenticatedCustomerId) {
        const rawCookieToken = req.cookies?.[VISITOR_COOKIE_NAME];
        const headerToken = req.headers['x-visitor-id'];
        const incomingToken = (rawCookieToken || headerToken)?.trim();
        let visitor = incomingToken
            ? await this.prisma.analyticsVisitor.findUnique({
                where: { visitorToken: incomingToken },
                include: {
                    consents: {
                        orderBy: { createdAt: 'desc' },
                        take: 1,
                    },
                },
            })
            : null;
        let isNewVisitor = false;
        const isConflictingCustomer = visitor &&
            authenticatedCustomerId &&
            visitor.customerId &&
            visitor.customerId !== authenticatedCustomerId;
        if (!visitor || isConflictingCustomer) {
            isNewVisitor = true;
            const newToken = randomUUID();
            visitor = await this.prisma.analyticsVisitor.create({
                data: {
                    visitorToken: newToken,
                    customerId: authenticatedCustomerId ?? null,
                    userAgent: req.headers['user-agent']?.substring(0, 500),
                    ipHash: this.hashIp(req.ip),
                },
                include: {
                    consents: {
                        orderBy: { createdAt: 'desc' },
                        take: 1,
                    },
                },
            });
        }
        else {
            const updateData = {
                lastSeenAt: new Date(),
            };
            if (authenticatedCustomerId && !visitor.customerId) {
                updateData.customerId = authenticatedCustomerId;
            }
            visitor = await this.prisma.analyticsVisitor.update({
                where: { id: visitor.id },
                data: updateData,
                include: {
                    consents: {
                        orderBy: { createdAt: 'desc' },
                        take: 1,
                    },
                },
            });
        }
        if (res && (!rawCookieToken || rawCookieToken !== visitor.visitorToken)) {
            res.cookie(VISITOR_COOKIE_NAME, visitor.visitorToken, {
                httpOnly: true,
                secure: this.isProduction,
                sameSite: 'lax',
                maxAge: 365 * 24 * 60 * 60 * 1000,
                path: '/',
            });
        }
        const session = await this.resolveSession(visitor.id, landingPage, referrer, deviceType);
        const latestConsent = visitor.consents[0];
        return {
            visitorId: visitor.id,
            visitorToken: visitor.visitorToken,
            sessionId: session.id,
            customerId: visitor.customerId,
            analyticsConsent: Boolean(latestConsent?.analyticsConsent),
            marketingConsent: Boolean(latestConsent?.marketingConsent),
            isNewVisitor,
        };
    }
    async resolveSession(visitorId, landingPage, referrer, deviceType) {
        const now = new Date();
        const latestSession = await this.prisma.analyticsSession.findFirst({
            where: { visitorId },
            orderBy: { lastActiveAt: 'desc' },
        });
        if (latestSession &&
            now.getTime() - new Date(latestSession.lastActiveAt).getTime() <
                SESSION_INACTIVITY_TIMEOUT_MS) {
            return this.prisma.analyticsSession.update({
                where: { id: latestSession.id },
                data: { lastActiveAt: now },
            });
        }
        let cleanReferrer;
        if (referrer) {
            try {
                const url = new URL(referrer);
                cleanReferrer = url.hostname;
            }
            catch {
                cleanReferrer = referrer.substring(0, 100);
            }
        }
        return this.prisma.analyticsSession.create({
            data: {
                visitorId,
                startedAt: now,
                lastActiveAt: now,
                landingPage: landingPage?.substring(0, 500),
                referrer: cleanReferrer,
                deviceType: deviceType?.substring(0, 50),
            },
        });
    }
    async recordConsent(visitorId, dto, ip) {
        return this.prisma.analyticsConsent.create({
            data: {
                visitorId,
                analyticsConsent: dto.analyticsConsent,
                marketingConsent: dto.marketingConsent,
                version: dto.version || '1.0',
                ipHash: this.hashIp(ip),
            },
        });
    }
    async getConsent(visitorToken) {
        const visitor = await this.prisma.analyticsVisitor.findUnique({
            where: { visitorToken },
            include: {
                consents: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                },
            },
        });
        if (!visitor)
            return null;
        const latest = visitor.consents[0];
        return {
            visitorToken: visitor.visitorToken,
            analyticsConsent: Boolean(latest?.analyticsConsent),
            marketingConsent: Boolean(latest?.marketingConsent),
            updatedAt: latest?.updatedAt || visitor.firstSeenAt,
        };
    }
};
VisitorSessionService = VisitorSessionService_1 = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService,
        ConfigService])
], VisitorSessionService);
export { VisitorSessionService };
//# sourceMappingURL=visitor-session.service.js.map