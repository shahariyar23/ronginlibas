import { AuthService } from '../services/auth.service.js';
import { LoginDto } from '../dto/login.dto.js';
import { RegisterCustomerDto } from '../dto/register.dto.js';
import { RefreshTokenDto } from '../dto/refresh-token.dto.js';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
                type: "customer" | "admin";
            };
        };
    }>;
    customerLogin(dto: LoginDto): Promise<{
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
                type: "customer" | "admin";
            };
        };
    }>;
    registerCustomer(dto: RegisterCustomerDto): Promise<{
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
                type: "customer" | "admin";
            };
        };
    }>;
    refreshTokens(dto: RefreshTokenDto): Promise<{
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
                type: "customer" | "admin";
            };
        };
    }>;
    getMe(user: any): Promise<{
        message: string;
        data: any;
    }>;
}
