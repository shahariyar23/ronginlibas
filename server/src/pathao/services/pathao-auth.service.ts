import {
  Injectable,
  Logger,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { PathaoTokenResponse } from '../pathao.types.js';

@Injectable()
export class PathaoAuthService {
  private readonly logger = new Logger(PathaoAuthService.name);

  private cachedAccessToken: string | null = null;
  private tokenExpiresAt: number | null = null;

  constructor(private readonly configService: ConfigService) {}

  /**
   * Environment safety guard: Ensures only Pathao SANDBOX environment is permitted.
   */
  public getEnvironment(): string {
    const env = (this.configService.get<string>('PATHAO_ENV') || 'sandbox').trim().toLowerCase();
    if (env !== 'sandbox') {
      this.logger.error(`Critical safety rejection: PATHAO_ENV is "${env}". Only "sandbox" is permitted.`);
      throw new BadRequestException(
        'Pathao integration is locked to sandbox environment only. Live production calls are strictly prohibited.',
      );
    }
    return 'sandbox';
  }

  /**
   * Safe Base URL resolver: Strictly prevents production URL access.
   */
  public getBaseUrl(): string {
    this.getEnvironment(); // Trigger sandbox safety guard

    const rawUrl = (
      this.configService.get<string>('PATHAO_BASE_URL') ||
      'https://courier-api-sandbox.pathao.com'
    ).trim();

    // Extra safeguard against live URLs
    if (rawUrl.includes('api-hermes.pathao.com') || (!rawUrl.includes('sandbox') && !rawUrl.includes('localhost'))) {
      this.logger.error(`Forbidden live Base URL detected: ${rawUrl}`);
      throw new BadRequestException(
        'Forbidden: Production Pathao base URL cannot be used in sandbox testing mode.',
      );
    }

    return rawUrl.replace(/\/+$/, '');
  }

  /**
   * Checks whether sandbox credentials are fully configured in environment.
   */
  public hasCredentials(): boolean {
    const clientId = this.configService.get<string>('PATHAO_CLIENT_ID')?.trim();
    const clientSecret = this.configService.get<string>('PATHAO_CLIENT_SECRET')?.trim();
    const username = this.configService.get<string>('PATHAO_USERNAME')?.trim();
    const password = this.configService.get<string>('PATHAO_PASSWORD')?.trim();

    return Boolean(clientId && clientSecret && username && password);
  }

  /**
   * Checks whether sandbox simulation fallback is enabled when upstream Pathao servers fail with 522/timeouts.
   */
  public isMockFallbackEnabled(): boolean {
    const mockVal = this.configService.get<string>('PATHAO_MOCK_FALLBACK');
    if (mockVal !== undefined) {
      return mockVal === 'true' || mockVal === '1';
    }
    // Default to true in sandbox so developers are never blocked by upstream Pathao 522 downtime
    return true;
  }

  /**
   * Checks if current active session is running in simulation mode.
   */
  public isSimulatedToken(): boolean {
    return Boolean(this.cachedAccessToken?.startsWith('pathao_sandbox_simulated_token'));
  }

  /**
   * Returns a valid cached Bearer token or generates a new one via OAuth.
   */
  public async getAccessToken(forceRefresh = false): Promise<string> {
    this.getEnvironment();

    const now = Date.now();
    if (!forceRefresh && this.cachedAccessToken && this.tokenExpiresAt && this.tokenExpiresAt > now) {
      return this.cachedAccessToken;
    }

    return this.issueAccessToken();
  }

  /**
   * Authenticates with Pathao Sandbox OAuth endpoint: POST /aladdin/api/v1/issue-token
   */
  public async issueAccessToken(): Promise<string> {
    this.getEnvironment();

    const baseUrl = this.getBaseUrl();
    const clientId = this.configService.get<string>('PATHAO_CLIENT_ID')?.trim();
    const clientSecret = this.configService.get<string>('PATHAO_CLIENT_SECRET')?.trim();
    const username = this.configService.get<string>('PATHAO_USERNAME')?.trim();
    const password = this.configService.get<string>('PATHAO_PASSWORD')?.trim();
    const grantType = (this.configService.get<string>('PATHAO_GRANT_TYPE') || 'password').trim();

    if (!clientId || !clientSecret || !username || !password) {
      this.logger.warn('Pathao sandbox authentication aborted: incomplete credentials in environment variables.');
      throw new UnauthorizedException(
        'Pathao sandbox credentials missing. Please set PATHAO_CLIENT_ID, PATHAO_CLIENT_SECRET, PATHAO_USERNAME, and PATHAO_PASSWORD in backend environment variables.',
      );
    }

    const tokenEndpoint = `${baseUrl}/aladdin/api/v1/issue-token`;
    const startTime = Date.now();

    try {
      this.logger.log(`Requesting Pathao sandbox OAuth token from ${tokenEndpoint}`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8-second timeout for snappy response

      let response: Response;
      try {
        response = await fetch(tokenEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            client_id: clientId,
            client_secret: clientSecret,
            username,
            password,
            grant_type: grantType,
          }),
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeoutId);
      }

      const durationMs = Date.now() - startTime;

      if (!response.ok) {
        const status = response.status;
        let errorBody = '';
        try {
          const jsonErr = await response.json();
          errorBody = jsonErr?.message || jsonErr?.error_description || jsonErr?.error || JSON.stringify(jsonErr);
        } catch {
          errorBody = await response.text();
        }

        this.logger.error(
          `Pathao sandbox OAuth token failed [${status}] in ${durationMs}ms: ${errorBody.slice(0, 150)}`,
        );

        if (status === 401 || status === 400) {
          throw new UnauthorizedException(
            `Pathao sandbox authentication failed (${status}). Please verify your sandbox client ID, secret, and merchant credentials.`,
          );
        }

        // Handle Cloudflare 522 (Connection Timed Out) or 504 Gateway Timeout from Pathao origin
        if (status === 522 || status === 524 || status === 504 || status >= 500) {
          if (this.isMockFallbackEnabled()) {
            this.logger.warn(
              `Pathao Sandbox origin is currently timing out (Cloudflare Error ${status}). Engaging Sandbox Simulation Fallback for local testing.`,
            );
            this.cachedAccessToken = 'pathao_sandbox_simulated_token_' + Date.now();
            this.tokenExpiresAt = Date.now() + 86400 * 1000;
            return this.cachedAccessToken;
          }

          throw new BadRequestException(
            `Pathao Sandbox server is currently timing out (Cloudflare Error ${status}). Pathao origin server is temporarily unreachable.`,
          );
        }

        throw new BadRequestException(
          `Pathao sandbox token request failed with status ${status}.`,
        );
      }

      const data = (await response.json()) as PathaoTokenResponse;

      if (!data?.access_token) {
        this.logger.error('Pathao sandbox response did not contain an access_token');
        throw new UnauthorizedException('Pathao sandbox response invalid: missing access token.');
      }

      this.cachedAccessToken = data.access_token;
      // Reserve 5-minute safety buffer before expiration
      const expiresInSec = typeof data.expires_in === 'number' ? data.expires_in : 3600;
      this.tokenExpiresAt = Date.now() + Math.max(60, expiresInSec - 300) * 1000;

      this.logger.log(
        `Pathao sandbox token acquired successfully in ${durationMs}ms (expires in ${expiresInSec}s).`,
      );

      return this.cachedAccessToken;
    } catch (err: any) {
      if (err instanceof UnauthorizedException || err instanceof BadRequestException) {
        throw err;
      }
      if (this.isMockFallbackEnabled()) {
        this.logger.warn(
          `Pathao sandbox network transport failed (${err?.message || err}). Engaging Sandbox Simulation Fallback.`,
        );
        this.cachedAccessToken = 'pathao_sandbox_simulated_token_' + Date.now();
        this.tokenExpiresAt = Date.now() + 86400 * 1000;
        return this.cachedAccessToken;
      }
      this.logger.error(`Pathao sandbox OAuth network/transport error: ${err?.message || err}`);
      throw new UnauthorizedException(
        `Pathao sandbox connection failed: ${err?.message || 'Network transport failure'}`,
      );
    }
  }

  /**
   * Invalidate cached token.
   */
  public clearToken(): void {
    this.cachedAccessToken = null;
    this.tokenExpiresAt = null;
    this.logger.log('Pathao sandbox access token cache cleared.');
  }
}
