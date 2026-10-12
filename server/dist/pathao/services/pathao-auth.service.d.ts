import { ConfigService } from '@nestjs/config';
export declare class PathaoAuthService {
    private readonly configService;
    private readonly logger;
    private cachedAccessToken;
    private tokenExpiresAt;
    constructor(configService: ConfigService);
    getEnvironment(): string;
    getBaseUrl(): string;
    hasCredentials(): boolean;
    isMockFallbackEnabled(): boolean;
    isSimulatedToken(): boolean;
    getAccessToken(forceRefresh?: boolean): Promise<string>;
    issueAccessToken(): Promise<string>;
    clearToken(): void;
}
