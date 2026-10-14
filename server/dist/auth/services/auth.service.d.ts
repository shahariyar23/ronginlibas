import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service.js';
import { ChangePasswordDto, ResetPasswordDto } from '../dto/password-reset.dto.js';
import { LoginDto } from '../dto/login.dto.js';
import { RegisterCustomerDto } from '../dto/register.dto.js';
import { AuthProvider } from '@prisma/client';
import { MailService } from '../../mail/mail.service.js';
import { FirebaseAdminService } from './firebase-admin.service.js';
import { SocialLoginDto } from '../dto/social-login.dto.js';
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    private readonly configService;
    private readonly mailService;
    private readonly firebaseAdminService;
    private readonly logger;
    constructor(prisma: PrismaService, jwtService: JwtService, configService: ConfigService, mailService: MailService, firebaseAdminService: FirebaseAdminService);
    adminLogin(dto: LoginDto): Promise<{
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            role: import("@prisma/client").$Enums.Role;
            permissions: string[];
            mustChangePassword: boolean;
        };
        accessToken: string;
        refreshToken: string;
        tokenType: string;
        expiresIn: string;
    }>;
    customerLogin(dto: LoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
        tokenType: string;
        expiresIn: string;
        user: {
            id: string;
            email: string | undefined;
            role: string;
            type: "customer" | "admin";
        };
    }>;
    socialLogin(dto: SocialLoginDto): Promise<{
        isNewCustomer: boolean;
        isProfileComplete: boolean;
        accessToken: string;
        refreshToken: string;
        tokenType: string;
        expiresIn: string;
        user: {
            id: string;
            email: string | undefined;
            role: string;
            type: "customer" | "admin";
        };
    }>;
    loginWithGoogle(credential: string): Promise<{
        isNewCustomer: boolean;
        isProfileComplete: boolean;
        accessToken: string;
        refreshToken: string;
        tokenType: string;
        expiresIn: string;
        user: {
            id: string;
            email: string | undefined;
            role: string;
            type: "customer" | "admin";
        };
    }>;
    linkGoogleAccount(customerId: string, credential: string): Promise<{
        createdAt: Date;
        id: string;
        provider: import("@prisma/client").$Enums.AuthProvider;
        providerEmail: string | null;
    } | {
        linked: boolean;
        provider: "GOOGLE";
        message: string;
    }>;
    linkSocialAccount(customerId: string, dto: SocialLoginDto): Promise<{
        linked: boolean;
        provider: import("@prisma/client").$Enums.AuthProvider;
        message: string;
    }>;
    unlinkSocialAccount(customerId: string, provider: AuthProvider): Promise<{
        unlinked: boolean;
        provider: import("@prisma/client").$Enums.AuthProvider;
        message: string;
    }>;
    getCustomerIdentities(customerId: string): Promise<{
        createdAt: Date;
        id: string;
        provider: import("@prisma/client").$Enums.AuthProvider;
        providerEmail: string | null;
    }[]>;
    registerCustomer(dto: RegisterCustomerDto): Promise<{
        accessToken: string;
        refreshToken: string;
        tokenType: string;
        expiresIn: string;
        user: {
            id: string;
            email: string | undefined;
            role: string;
            type: "customer" | "admin";
        };
    }>;
    refreshTokens(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
        tokenType: string;
        expiresIn: string;
        user: {
            id: string;
            email: string | undefined;
            role: string;
            type: "customer" | "admin";
        };
    }>;
    logoutCustomer(customerId: string): Promise<{
        loggedOut: boolean;
    }>;
    changeCustomerPassword(customerId: string, dto: ChangePasswordDto): Promise<{
        passwordChanged: boolean;
    }>;
    requestPasswordReset(email: string): Promise<{
        message: string;
    }>;
    resetCustomerPassword(dto: ResetPasswordDto): Promise<{
        passwordReset: boolean;
    }>;
    private issueCustomerSession;
    private generateTokens;
    private refreshSecret;
}
