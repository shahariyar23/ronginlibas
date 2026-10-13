import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { randomUUID, createHash } from 'node:crypto';
import { PrismaService } from '../../prisma/prisma.service.js';
import { UpdateConsentDto } from '../dto/track-event.dto.js';

export const VISITOR_COOKIE_NAME = 'rl_vid';
const SESSION_INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

export interface ResolvedVisitorContext {
  visitorId: string;
  visitorToken: string;
  sessionId: string;
  customerId: string | null;
  analyticsConsent: boolean;
  marketingConsent: boolean;
  isNewVisitor: boolean;
}

@Injectable()
export class VisitorSessionService {
  private readonly logger = new Logger(VisitorSessionService.name);
  private readonly isProduction: boolean;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.isProduction = this.configService.get<string>('NODE_ENV') === 'production';
  }

  /**
   * Hashes client IP for GDPR-compliant consent auditing without storing raw IP.
   */
  public hashIp(ip?: string): string | undefined {
    if (!ip) return undefined;
    return createHash('sha256').update(ip).digest('hex').substring(0, 32);
  }

  /**
   * Resolves the pseudonymous visitor identity from HttpOnly cookies or fallback headers,
   * safely attaches authenticated customer IDs, manages sessions, and writes the response cookie.
   */
  async resolveVisitorAndSession(
    req: Request,
    res?: Response,
    landingPage?: string,
    referrer?: string,
    deviceType?: string,
    authenticatedCustomerId?: string,
  ): Promise<ResolvedVisitorContext> {
    const rawCookieToken = req.cookies?.[VISITOR_COOKIE_NAME];
    const headerToken = req.headers['x-visitor-id'] as string | undefined;
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

    // Detect if a different customer is logging into an existing visitor record on a shared device
    const isConflictingCustomer =
      visitor &&
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
    } else {
      // Update last seen and link customer if previously anonymous
      const updateData: { lastSeenAt: Date; customerId?: string } = {
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

    // Set or refresh secure HttpOnly cookie
    if (res && (!rawCookieToken || rawCookieToken !== visitor.visitorToken)) {
      res.cookie(VISITOR_COOKIE_NAME, visitor.visitorToken, {
        httpOnly: true,
        secure: this.isProduction,
        sameSite: 'lax',
        maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
        path: '/',
      });
    }

    // Session resolution
    const session = await this.resolveSession(
      visitor.id,
      landingPage,
      referrer,
      deviceType,
    );

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

  /**
   * Resolves or creates an active session. If inactive for > 30 minutes, creates a new session.
   */
  private async resolveSession(
    visitorId: string,
    landingPage?: string,
    referrer?: string,
    deviceType?: string,
  ) {
    const now = new Date();
    const latestSession = await this.prisma.analyticsSession.findFirst({
      where: { visitorId },
      orderBy: { lastActiveAt: 'desc' },
    });

    if (
      latestSession &&
      now.getTime() - new Date(latestSession.lastActiveAt).getTime() <
        SESSION_INACTIVITY_TIMEOUT_MS
    ) {
      return this.prisma.analyticsSession.update({
        where: { id: latestSession.id },
        data: { lastActiveAt: now },
      });
    }

    // Parse clean referrer hostname safely
    let cleanReferrer: string | undefined;
    if (referrer) {
      try {
        const url = new URL(referrer);
        cleanReferrer = url.hostname;
      } catch {
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

  /**
   * Records or updates consent preferences for a visitor.
   */
  async recordConsent(
    visitorId: string,
    dto: UpdateConsentDto,
    ip?: string,
  ) {
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

  /**
   * Retrieves current consent status for a visitor token.
   */
  async getConsent(visitorToken: string) {
    const visitor = await this.prisma.analyticsVisitor.findUnique({
      where: { visitorToken },
      include: {
        consents: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!visitor) return null;

    const latest = visitor.consents[0];
    return {
      visitorToken: visitor.visitorToken,
      analyticsConsent: Boolean(latest?.analyticsConsent),
      marketingConsent: Boolean(latest?.marketingConsent),
      updatedAt: latest?.updatedAt || visitor.firstSeenAt,
    };
  }
}
