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
import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service.js';
import { LoginDto } from '../dto/login.dto.js';
import { RegisterCustomerDto } from '../dto/register.dto.js';
import { RefreshTokenDto } from '../dto/refresh-token.dto.js';
import { Public } from '../../common/decorators/public.decorator.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../guards/jwt-auth.guard.js';
let AuthController = class AuthController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    async adminLogin(dto) {
        const data = await this.authService.adminLogin(dto);
        return {
            message: 'Admin authenticated successfully',
            data,
        };
    }
    async customerLogin(dto) {
        const data = await this.authService.customerLogin(dto);
        return {
            message: 'Customer authenticated successfully',
            data,
        };
    }
    async registerCustomer(dto) {
        const data = await this.authService.registerCustomer(dto);
        return {
            message: 'Patron registered successfully',
            data,
        };
    }
    async refreshTokens(dto) {
        const data = await this.authService.refreshTokens(dto);
        return {
            message: 'Tokens refreshed successfully',
            data,
        };
    }
    async getMe(user) {
        return {
            message: 'Session retrieved successfully',
            data: user,
        };
    }
};
__decorate([
    Public(),
    Post('admin/login'),
    ApiOperation({ summary: 'Authenticate admin dashboard user' }),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [LoginDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "adminLogin", null);
__decorate([
    Public(),
    Post('customer/login'),
    ApiOperation({ summary: 'Authenticate storefront customer' }),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [LoginDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "customerLogin", null);
__decorate([
    Public(),
    Post('customer/register'),
    ApiOperation({ summary: 'Register a new customer account' }),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [RegisterCustomerDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "registerCustomer", null);
__decorate([
    Public(),
    Post('refresh'),
    ApiOperation({ summary: 'Rotate expired access token using refresh token' }),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [RefreshTokenDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refreshTokens", null);
__decorate([
    UseGuards(JwtAuthGuard),
    ApiBearerAuth(),
    Get('me'),
    ApiOperation({ summary: 'Retrieve currently authenticated session details' }),
    __param(0, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getMe", null);
AuthController = __decorate([
    ApiTags('Authentication'),
    Controller('auth'),
    __metadata("design:paramtypes", [AuthService])
], AuthController);
export { AuthController };
//# sourceMappingURL=auth.controller.js.map