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
import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from '../services/users.service.js';
import { CreateUserDto } from '../dto/create-user.dto.js';
import { UpdateUserDto } from '../dto/update-user.dto.js';
import { ChangeUserPasswordDto } from '../dto/change-user-password.dto.js';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Permissions } from '../../common/decorators/permissions.decorator.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { UserRole } from '../../common/constants/roles.constant.js';
let UsersController = class UsersController {
    usersService;
    constructor(usersService) {
        this.usersService = usersService;
    }
    async create(dto) {
        const data = await this.usersService.create(dto);
        return {
            message: 'Staff user created successfully',
            data,
        };
    }
    async changePassword(userId, dto) {
        const data = await this.usersService.changePassword(userId, dto);
        return {
            message: 'Password updated successfully',
            data,
        };
    }
    async getMe(userId) {
        const data = await this.usersService.findById(userId);
        return {
            message: 'Staff profile retrieved successfully',
            data,
        };
    }
    async findAll() {
        const data = await this.usersService.findAll();
        return {
            message: 'Staff users retrieved successfully',
            data,
        };
    }
    async findById(id) {
        const data = await this.usersService.findById(id);
        return {
            message: 'Staff user retrieved successfully',
            data,
        };
    }
    async update(id, dto, currentUserId) {
        const data = await this.usersService.update(id, dto, currentUserId);
        return {
            message: 'Staff user updated successfully',
            data,
        };
    }
    async delete(id, currentUserId) {
        const data = await this.usersService.delete(id, currentUserId);
        return {
            message: 'Staff user deleted successfully',
            data,
        };
    }
};
__decorate([
    Roles(UserRole.SUPER_ADMIN),
    Post(),
    ApiOperation({ summary: 'Create new administrative staff member' }),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateUserDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "create", null);
__decorate([
    Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
    Patch('me/change-password'),
    ApiOperation({ summary: 'Change password for currently authenticated staff or admin' }),
    __param(0, CurrentUser('sub')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, ChangeUserPasswordDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "changePassword", null);
__decorate([
    Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
    Get('me'),
    ApiOperation({ summary: 'Retrieve currently authenticated staff user profile and permissions' }),
    __param(0, CurrentUser('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getMe", null);
__decorate([
    Roles(UserRole.SUPER_ADMIN),
    Permissions('staff'),
    Get(),
    ApiOperation({ summary: 'List all administrative staff users' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findAll", null);
__decorate([
    Roles(UserRole.SUPER_ADMIN),
    Permissions('staff'),
    Get(':id'),
    ApiOperation({ summary: 'Retrieve staff user by ID' }),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findById", null);
__decorate([
    Roles(UserRole.SUPER_ADMIN),
    Patch(':id'),
    ApiOperation({ summary: 'Update staff member details, role, permissions or status' }),
    __param(0, Param('id')),
    __param(1, Body()),
    __param(2, CurrentUser('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateUserDto, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "update", null);
__decorate([
    Roles(UserRole.SUPER_ADMIN),
    Delete(':id'),
    ApiOperation({ summary: 'Delete staff member' }),
    __param(0, Param('id')),
    __param(1, CurrentUser('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "delete", null);
UsersController = __decorate([
    ApiTags('Admin - Users'),
    ApiBearerAuth(),
    UseGuards(JwtAuthGuard, RolesGuard),
    Controller('admin/users'),
    __metadata("design:paramtypes", [UsersService])
], UsersController);
export { UsersController };
//# sourceMappingURL=users.controller.js.map