var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var FirebaseAdminService_1;
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { AuthProvider } from '@prisma/client';
let FirebaseAdminService = FirebaseAdminService_1 = class FirebaseAdminService {
    configService;
    logger = new Logger(FirebaseAdminService_1.name);
    firebaseApp = null;
    isConfigured = false;
    constructor(configService) {
        this.configService = configService;
        this.initFirebase();
    }
    initFirebase() {
        try {
            const existingApps = getApps();
            if (existingApps.length > 0) {
                this.firebaseApp = existingApps[0];
                this.isConfigured = true;
                return;
            }
            const projectId = this.configService.get('FIREBASE_PROJECT_ID') ||
                process.env.FIREBASE_PROJECT_ID;
            const clientEmail = this.configService.get('FIREBASE_CLIENT_EMAIL') ||
                process.env.FIREBASE_CLIENT_EMAIL;
            let privateKey = this.configService.get('FIREBASE_PRIVATE_KEY') ||
                process.env.FIREBASE_PRIVATE_KEY;
            if (projectId && clientEmail && privateKey) {
                privateKey = privateKey.trim().replace(/^["']|["']$/g, '');
                if (privateKey.endsWith('\\')) {
                    privateKey = privateKey.slice(0, -1).trim();
                }
                if (privateKey.includes('\\n')) {
                    privateKey = privateKey.replace(/\\n/g, '\n');
                }
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
            }
            else if (projectId) {
                this.firebaseApp = initializeApp({
                    projectId,
                });
                this.isConfigured = true;
                this.logger.log(`Firebase Admin initialized with project ID "${projectId}".`);
            }
            else {
                this.logger.warn('Firebase Admin credentials not set. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in .env for live Firebase verification.');
            }
        }
        catch (err) {
            this.logger.error(`Firebase Admin initialization error: ${err.message}`, err.stack);
        }
    }
    async verifyIdToken(idToken) {
        if (!idToken || typeof idToken !== 'string') {
            throw new UnauthorizedException('Missing social authentication token.');
        }
        if (!this.isConfigured || !this.firebaseApp) {
            this.logger.warn('Firebase Admin is not fully configured with service account credentials. Attempting token verification...');
        }
        try {
            const authInstance = this.firebaseApp ? getAuth(this.firebaseApp) : getAuth();
            const decoded = await authInstance.verifyIdToken(idToken);
            return this.mapClaimsToProfile(decoded);
        }
        catch (error) {
            this.logger.warn(`Firebase token verification failed: ${error.message}`);
            throw new UnauthorizedException(error.code === 'auth/id-token-expired'
                ? 'Social authentication session has expired. Please sign in again.'
                : 'Invalid or unverified social authentication credentials.');
        }
    }
    mapClaimsToProfile(claims) {
        const signInProvider = claims.firebase?.sign_in_provider || '';
        let provider;
        if (signInProvider.includes('facebook') || 'facebook.com' in (claims.firebase?.identities || {})) {
            throw new UnauthorizedException('Facebook authentication is not supported.');
        }
        if (signInProvider.includes('apple') || 'apple.com' in (claims.firebase?.identities || {})) {
            throw new UnauthorizedException('Apple authentication is not supported.');
        }
        provider = AuthProvider.GOOGLE;
        const email = claims.email ? claims.email.toLowerCase().trim() : null;
        const emailVerified = Boolean(claims.email_verified);
        let firstName = 'Patron';
        let lastName = null;
        if (claims.name && typeof claims.name === 'string') {
            const parts = claims.name.trim().split(/\s+/);
            firstName = parts[0] || 'Patron';
            lastName = parts.slice(1).join(' ') || null;
        }
        else if (email) {
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
};
FirebaseAdminService = FirebaseAdminService_1 = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [ConfigService])
], FirebaseAdminService);
export { FirebaseAdminService };
//# sourceMappingURL=firebase-admin.service.js.map