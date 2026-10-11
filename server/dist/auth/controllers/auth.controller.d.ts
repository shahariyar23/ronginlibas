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
            accessToken: string;
            refreshToken: string;
            tokenType: string;
            expiresIn: string;
            user: {
                id: string;
                email: string | undefined;
                role: string;
                type: "admin" | "customer";
            };
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
                type: "admin" | "customer";
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
                type: "admin" | "customer";
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
                type: "admin" | "customer";
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
                type: "admin" | "customer";
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
                type: "admin" | "customer";
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
        data: any;
    }>;
    linkSocial(customerId: string, dto: SocialLoginDto): Promise<{
        message: string;
        data: any;
    }>;
    unlinkSocial(customerId: string, provider: AuthProvider): Promise<{
        message: string;
        data: any;
    }>;
    getIdentities(customerId: string): Promise<{
        message: string;
        data: any;
    }>;
    private loginCustomer;
    private setRefreshCookie;
    private clearRefreshCookie;
}
