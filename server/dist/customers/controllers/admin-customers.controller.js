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
import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CustomersService } from '../services/customers.service.js';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { UserRole } from '../../common/constants/roles.constant.js';
let AdminCustomersController = class AdminCustomersController {
    customersService;
    constructor(customersService) {
        this.customersService = customersService;
    }
    async findAll(query) {
        const data = await this.customersService.findAll(query);
        return {
            message: 'Clientele roster retrieved successfully',
            data,
        };
    }
    async findById(id) {
        const data = await this.customersService.findById(id);
        return {
            message: 'Customer details retrieved successfully',
            data,
        };
    }
};
__decorate([
    Get(),
    ApiOperation({ summary: 'List clientele roster with pagination and search' }),
    __param(0, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [PaginationQueryDto]),
    __metadata("design:returntype", Promise)
], AdminCustomersController.prototype, "findAll", null);
__decorate([
    Get(':id'),
    ApiOperation({ summary: 'Retrieve specific customer profile and order history' }),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminCustomersController.prototype, "findById", null);
AdminCustomersController = __decorate([
    ApiTags('Admin - Customers'),
    ApiBearerAuth(),
    UseGuards(JwtAuthGuard, RolesGuard),
    Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
    Controller('admin/customers'),
    __metadata("design:paramtypes", [CustomersService])
], AdminCustomersController);
export { AdminCustomersController };
//# sourceMappingURL=admin-customers.controller.js.map