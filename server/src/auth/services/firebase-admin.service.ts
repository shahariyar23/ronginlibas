import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { App, cert, getApps, initializeApp } from 'firebase-admin/app';
import { DecodedIdToken, getAuth } from 'firebase-admin/auth';
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

@Injectable()
export class FirebaseAdminService {
  private readonly logger = new Logger(FirebaseAdminService.name);
  private firebaseApp: App | null = null;
  private isConfigured = false;

  constructor(private readonly configService: ConfigService) {
    this.initFirebase();
  }

  private initFirebase() {
    try {
      const existingApps = getApps();
      if (existingApps.length > 0) {
        this.firebaseApp = existingApps[0]!;
        this.isConfigured = true;
        return;
      }

      const projectId =
        this.configService.get<string>('FIREBASE_PROJECT_ID') ||
        process.env.FIREBASE_PROJECT_ID;
      const clientEmail =
        this.configService.get<string>('FIREBASE_CLIENT_EMAIL') ||
        process.env.FIREBASE_CLIENT_EMAIL;
      let privateKey =
        this.configService.get<string>('FIREBASE_PRIVATE_KEY') ||
        process.env.FIREBASE_PRIVATE_KEY;

      if (projectId && clientEmail && privateKey) {
        // Strip surrounding quotes if present
        privateKey = privateKey.trim().replace(/^["']|["']$/g, '');

        // Strip trailing backslash if present
        if (privateKey.endsWith('\\')) {
          privateKey = privateKey.slice(0, -1).trim();
        }

        // Fix line breaks if private key is passed as a string with literal \n
        if (privateKey.includes('\\n')) {
          privateKey = privateKey.replace(/\\n/g, '\n');
        }

        // Add PEM header/footer if missing
        if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
          privateKey = `-----BEGIN PRIVATE KEY-----\n${privateKey}\n-----END PRIVATE KEY-----\n`;
        }

        this.firebaseApp = initializeApp({
          credential: cert({
            projectId,
            clientEmail,
            privateKey,
          }),
        });
        this.isConfigured = true;
        this.logger.log(`Firebase Admin initialized successfully for project "${projectId}".`);
      } else if (projectId) {
        // Fallback to project ID only
        this.firebaseApp = initializeApp({
          projectId,
        });
        this.isConfigured = true;
        this.logger.log(`Firebase Admin initialized with project ID "${projectId}".`);
      } else {
        this.logger.warn(
          'Firebase Admin credentials not set. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in .env for live Firebase verification.',
        );
      }
    } catch (err: any) {
      this.logger.error(`Firebase Admin initialization error: ${err.message}`, err.stack);
    }
  }

  /**
   * Verify Firebase ID Token and map claims into a normalized VerifiedSocialProfile
   */
  async verifyIdToken(idToken: string): Promise<VerifiedSocialProfile> {
    if (!idToken || typeof idToken !== 'string') {
      throw new UnauthorizedException('Missing social authentication token.');
    }

    if (!this.isConfigured || !this.firebaseApp) {
      this.logger.warn(
        'Firebase Admin is not fully configured with service account credentials. Attempting token verification...',
      );
    }

    try {
      const authInstance = this.firebaseApp ? getAuth(this.firebaseApp) : getAuth();
      const decoded = await authInstance.verifyIdToken(idToken);
      return this.mapClaimsToProfile(decoded);
    } catch (error: any) {
      this.logger.warn(`Firebase token verification failed: ${error.message}`);
      throw new UnauthorizedException(
        error.code === 'auth/id-token-expired'
          ? 'Social authentication session has expired. Please sign in again.'
          : 'Invalid or unverified social authentication credentials.',
      );
    }
  }

  private mapClaimsToProfile(claims: DecodedIdToken): VerifiedSocialProfile {
    const signInProvider = claims.firebase?.sign_in_provider || '';
    let provider: AuthProvider;

    if (signInProvider.includes('facebook') || 'facebook.com' in (claims.firebase?.identities || {})) {
      throw new UnauthorizedException('Facebook authentication is not supported.');
    }
    if (signInProvider.includes('apple') || 'apple.com' in (claims.firebase?.identities || {})) {
      throw new UnauthorizedException('Apple authentication is not supported.');
    }

    provider = AuthProvider.GOOGLE;

    const email = claims.email ? claims.email.toLowerCase().trim() : null;
    const emailVerified = Boolean(claims.email_verified);

    // Split name into first and last
    let firstName = 'Patron';
    let lastName: string | null = null;

    if (claims.name && typeof claims.name === 'string') {
      const parts = claims.name.trim().split(/\s+/);
      firstName = parts[0] || 'Patron';
      lastName = parts.slice(1).join(' ') || null;
    } else if (email) {
      firstName = email.split('@')[0] || 'Patron';
    }

    const photoUrl = typeof claims.picture === 'string' ? claims.picture : null;

    return {
      provider,
      providerUserId: claims.uid,
      email,
      emailVerified,
      firstName,
      lastName,
      photoUrl,
    };
  }
}
