var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Body, Controller, Get, Post, Req, Res, UnauthorizedException, UseGuards, } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from '../services/auth.service.js';
import { LoginDto } from '../dto/login.dto.js';
import { RegisterCustomerDto } from '../dto/register.dto.js';
import { RefreshTokenDto } from '../dto/refresh-token.dto.js';
import { ChangePasswordDto, ForgotPasswordDto, ResetPasswordDto, } from '../dto/password-reset.dto.js';
import { Public } from '../../common/decorators/public.decorator.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../guards/jwt-auth.guard.js';
import { CustomerAuthGuard } from '../guards/customer-auth.guard.js';
const REFRESH_COOKIE = 'rongin_libas_refresh';
const REFRESH_COOKIE_PATH = '/api/v1/auth/refresh';
let AuthController = class AuthController {
    authService;
    configService;
    constructor(authService, configService) {
        this.authService = authService;
        this.configService = configService;
    }
    async adminLogin(dto) {
        return {
            message: 'Admin authenticated successfully',
            data: await this.authService.adminLogin(dto),
        };
    }
    async customerLogin(dto, response) {
        return this.loginCustomer(dto, response);
    }
    async legacyCustomerLogin(dto, response) {
        return this.loginCustomer(dto, response);
    }
    async register(dto, response) {
        const tokens = await this.authService.registerCustomer(dto);
        this.setRefreshCookie(response, tokens.refreshToken);
        const { refreshToken: _refreshToken, ...data } = tokens;
        return { message: 'Customer registered successfully', data };
    }
    async legacyRegister(dto, response) {
        const tokens = await this.authService.registerCustomer(dto);
        this.setRefreshCookie(response, tokens.refreshToken);
        const { refreshToken: _refreshToken, ...data } = tokens;
        return { message: 'Customer registered successfully', data };
    }
    async refreshTokens(dto = {}, request, response) {
        const refreshToken = dto?.refreshToken ?? cookieValue(request.headers.cookie, REFRESH_COOKIE);
        if (!refreshToken)
            throw new UnauthorizedException('Refresh token is required');
        const tokens = await this.authService.refreshTokens(refreshToken);
        if (tokens.user.type === 'customer') {
            this.setRefreshCookie(response, tokens.refreshToken);
            const { refreshToken: _refreshToken, ...data } = tokens;
            return { message: 'Customer session refreshed successfully', data };
        }
        return { message: 'Admin session refreshed successfully', data: tokens };
    }
    async logout(customerId, response) {
        await this.authService.logoutCustomer(customerId);
        this.clearRefreshCookie(response);
        return { message: 'Customer session ended successfully', data: { loggedOut: true } };
    }
    async forgotPassword(dto) {
        return {
            message: 'If an account exists for that address, a reset link will be sent.',
            data: await this.authService.requestPasswordReset(dto.email),
        };
    }
    async resetPassword(dto) {
        return {
            message: 'Password reset successfully',
            data: await this.authService.resetCustomerPassword(dto),
        };
    }
    async changePassword(customerId, dto, response) {
        const data = await this.authService.changeCustomerPassword(customerId, dto);
        this.clearRefreshCookie(response);
        return { message: 'Password changed successfully; sign in again to continue', data };
    }
    async getMe(user) {
        return { message: 'Session retrieved successfully', data: user };
    }
    async loginCustomer(dto, response) {
        const tokens = await this.authService.customerLogin(dto);
        this.setRefreshCookie(response, tokens.refreshToken);
        const { refreshToken: _refreshToken, ...data } = tokens;
        return { message: 'Customer authenticated successfully', data };
    }
    setRefreshCookie(response, token) {
        const production = this.configService.get('app.nodeEnv') === 'production';
        response.cookie(REFRESH_COOKIE, token, {
            httpOnly: true,
            secure: production,
            sameSite: production ? 'none' : 'lax',
            path: REFRESH_COOKIE_PATH,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
    }
    clearRefreshCookie(response) {
        const production = this.configService.get('app.nodeEnv') === 'production';
        response.clearCookie(REFRESH_COOKIE, {
            httpOnly: true,
            secure: production,
            sameSite: production ? 'none' : 'lax',
            path: REFRESH_COOKIE_PATH,
        });
    }
};
__decorate([
    Public(),
    Post('admin/login'),
    Throttle({ default: { limit: 5, ttl: 60_000 } }),
    ApiOperation({ summary: 'Authenticate an admin dashboard user' }),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [LoginDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "adminLogin", null);
__decorate([
    Public(),
    Post('login'),
    Throttle({ default: { limit: 5, ttl: 60_000 } }),
    ApiOperation({ summary: 'Authenticate a customer and set the refresh cookie' }),
    __param(0, Body()),
    __param(1, Res({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [LoginDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "customerLogin", null);
__decorate([
    Public(),
    Post('customer/login'),
    Throttle({ default: { limit: 5, ttl: 60_000 } }),
    ApiOperation({ summary: 'Legacy customer login route' }),
    __param(0, Body()),
    __param(1, Res({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [LoginDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "legacyCustomerLogin", null);
__decorate([
    Public(),
    Post('register'),
    Throttle({ default: { limit: 5, ttl: 60_000 } }),
    ApiOperation({ summary: 'Register a customer account' }),
    __param(0, Body()),
    __param(1, Res({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [RegisterCustomerDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    Public(),
    Post('customer/register'),
    Throttle({ default: { limit: 5, ttl: 60_000 } }),
    ApiOperation({ summary: 'Legacy customer registration route' }),
    __param(0, Body()),
    __param(1, Res({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [RegisterCustomerDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "legacyRegister", null);
__decorate([
    Public(),
    Post('refresh'),
    ApiOperation({ summary: 'Rotate a refresh token from the secure cookie' }),
    __param(0, Body()),
    __param(1, Req()),
    __param(2, Res({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [RefreshTokenDto, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refreshTokens", null);
__decorate([
    Post('logout'),
    UseGuards(CustomerAuthGuard),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Revoke the current customer refresh session' }),
    __param(0, CurrentUser('id')),
    __param(1, Res({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    Public(),
    Post('forgot-password'),
    Throttle({ default: { limit: 3, ttl: 60_000 } }),
    ApiOperation({ summary: 'Request a password-reset email without disclosing account existence' }),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ForgotPasswordDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "forgotPassword", null);
__decorate([
    Public(),
    Post('reset-password'),
    Throttle({ default: { limit: 5, ttl: 60_000 } }),
    ApiOperation({ summary: 'Reset a password using a single-use time-limited token' }),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ResetPasswordDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resetPassword", null);
__decorate([
    Post('change-password'),
    UseGuards(CustomerAuthGuard),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Change the authenticated customer password' }),
    __param(0, CurrentUser('id')),
    __param(1, Body()),
    __param(2, Res({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, ChangePasswordDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "changePassword", null);
__decorate([
    UseGuards(JwtAuthGuard),
    ApiBearerAuth(),
    Get('me'),
    ApiOperation({ summary: 'Retrieve the current authenticated session identity' }),
    __param(0, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getMe", null);
AuthController = __decorate([
    ApiTags('Auth'),
    Controller('auth'),
    __metadata("design:paramtypes", [AuthService,
        ConfigService])
], AuthController);
export { AuthController };
function cookieValue(cookieHeader, name) {
    if (!cookieHeader)
        return undefined;
    for (const segment of cookieHeader.split(';')) {
        const [key, ...value] = segment.trim().split('=');
        if (key === name) {
            try {
                return decodeURIComponent(value.join('='));
            }
            catch {
                return undefined;
            }
        }
    }
    return undefined;
}
//# sourceMappingURL=auth.controller.js.map