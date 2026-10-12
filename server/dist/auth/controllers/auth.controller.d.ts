import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { AuthProvider } from '@prisma/client';
import { AuthService } from '../services/auth.service.js';
import { LoginDto } from '../dto/login.dto.js';
import { RegisterCustomerDto } from '../dto/register.dto.js';
import { RefreshTokenDto } from '../dto/refresh-token.dto.js';
import { SocialLoginDto } from '../dto/social-login.dto.js';
import { ChangePasswordDto, ForgotPasswordDto, ResetPasswordDto } from '../dto/password-reset.dto.js';
export declare class AuthController {
    private readonly authService;
    private readonly configService;
    constructor(authService: AuthService, configService: ConfigService);
    adminLogin(dto: LoginDto): Promise<{
        message: string;
        data: {
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
        };
    }>;
    customerLogin(dto: LoginDto, response: Response): Promise<{
        message: string;
        data: {
            accessToken: string;
            tokenType: string;
            expiresIn: string;
            user: {
                id: string;
                email: string | undefined;
                role: string;
                type: "customer" | "admin";
            };
        };
    }>;
    legacyCustomerLogin(dto: LoginDto, response: Response): Promise<{
        message: string;
        data: {
            accessToken: string;
            tokenType: string;
            expiresIn: string;
            user: {
                id: string;
                email: string | undefined;
                role: string;
                type: "customer" | "admin";
            };
        };
    }>;
    register(dto: RegisterCustomerDto, response: Response): Promise<{
        message: string;
        data: {
            accessToken: string;
            tokenType: string;
            expiresIn: string;
            user: {
                id: string;
                email: string | undefined;
                role: string;
                type: "customer" | "admin";
            };
        };
    }>;
    legacyRegister(dto: RegisterCustomerDto, response: Response): Promise<{
        message: string;
        data: {
            accessToken: string;
            tokenType: string;
            expiresIn: string;
            user: {
                id: string;
                email: string | undefined;
                role: string;
                type: "customer" | "admin";
            };
        };
    }>;
    refreshTokens(dto: RefreshTokenDto | undefined, request: Request, response: Response): Promise<{
        message: string;
        data: {
            accessToken: string;
            tokenType: string;
            expiresIn: string;
            user: {
                id: string;
                email: string | undefined;
                role: string;
                type: "customer" | "admin";
            };
        };
    }>;
    logout(customerId: string, response: Response): Promise<{
        message: string;
        data: {
            loggedOut: boolean;
        };
    }>;
    forgotPassword(dto: ForgotPasswordDto): Promise<{
        message: string;
        data: {
            message: string;
        };
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        message: string;
        data: {
            passwordReset: boolean;
        };
    }>;
    changePassword(customerId: string, dto: ChangePasswordDto, response: Response): Promise<{
        message: string;
        data: {
            passwordChanged: boolean;
        };
    }>;
    getMe(user: unknown): Promise<{
        message: string;
        data: unknown;
    }>;
    socialLogin(dto: SocialLoginDto, response: Response): Promise<{
        message: string;
        data: {
            isNewCustomer: boolean;
            isProfileComplete: boolean;
            accessToken: string;
            tokenType: string;
            expiresIn: string;
            user: {
                id: string;
                email: string | undefined;
                role: string;
                type: "customer" | "admin";
            };
        };
    }>;
    linkSocial(customerId: string, dto: SocialLoginDto): Promise<{
        message: string;
        data: {
            linked: boolean;
            provider: import("@prisma/client").$Enums.AuthProvider;
            message: string;
        };
    }>;
    unlinkSocial(customerId: string, provider: AuthProvider): Promise<{
        message: string;
        data: {
            unlinked: boolean;
            provider: import("@prisma/client").$Enums.AuthProvider;
            message: string;
        };
    }>;
    getIdentities(customerId: string): Promise<{
        message: string;
        data: {
            id: string;
            createdAt: Date;
            provider: import("@prisma/client").$Enums.AuthProvider;
            providerEmail: string | null;
        }[];
    }>;
    private loginCustomer;
    private setRefreshCookie;
    private clearRefreshCookie;
}
