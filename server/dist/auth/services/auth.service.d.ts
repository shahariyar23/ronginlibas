import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service.js';
import { ChangePasswordDto, ResetPasswordDto } from '../dto/password-reset.dto.js';
import { LoginDto } from '../dto/login.dto.js';
import { RegisterCustomerDto } from '../dto/register.dto.js';
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    private readonly configService;
    private readonly logger;
    constructor(prisma: PrismaService, jwtService: JwtService, configService: ConfigService);
    adminLogin(dto: LoginDto): Promise<{
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
