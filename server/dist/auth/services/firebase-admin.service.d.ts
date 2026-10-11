import { ConfigService } from '@nestjs/config';
import { AuthProvider } from '@prisma/client';
export interface VerifiedSocialProfile {
    provider: AuthProvider;
    providerUserId: string;
    email: string | null;
    emailVerified: boolean;
    firstName: string;
    lastName: string | null;
    photoUrl: string | null;
}
export declare class FirebaseAdminService {
    private readonly configService;
    private readonly logger;
    private firebaseApp;
    private isConfigured;
    constructor(configService: ConfigService);
    private initFirebase;
    verifyIdToken(idToken: string): Promise<VerifiedSocialProfile>;
    private mapClaimsToProfile;
}
