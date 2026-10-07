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
import { Body, Controller, Delete, Get, Param, Patch, Post, Put, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CustomersService } from '../services/customers.service.js';
import { CustomerAuthGuard } from '../../auth/guards/customer-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { UpdateCustomerProfileDto } from '../dto/update-customer-profile.dto.js';
import { CreateAddressDto, UpdateAddressDto } from '../dto/address.dto.js';
import { MeasurementProfileDto } from '../dto/measurement-profile.dto.js';
let CustomersController = class CustomersController {
    customersService;
    constructor(customersService) {
        this.customersService = customersService;
    }
    async getProfile(customerId) {
        const data = await this.customersService.findMyProfile(customerId);
        return {
            message: 'Profile retrieved successfully',
            data,
        };
    }
    async updateProfile(customerId, dto) {
        return {
            message: 'Profile updated successfully',
            data: await this.customersService.updateMyProfile(customerId, dto),
        };
    }
    async getDashboard(customerId) {
        return {
            message: 'Customer dashboard retrieved successfully',
            data: await this.customersService.getDashboard(customerId),
        };
    }
    async findAddresses(customerId) {
        return {
            message: 'Addresses retrieved successfully',
            data: await this.customersService.findAddresses(customerId),
        };
    }
    async createAddress(customerId, dto) {
        return {
            message: 'Address created successfully',
            data: await this.customersService.createAddress(customerId, dto),
        };
    }
    async setDefaultAddress(customerId, addressId) {
        return {
            message: 'Default address updated successfully',
            data: await this.customersService.setDefaultAddress(customerId, addressId),
        };
    }
    async updateAddress(customerId, addressId, dto) {
        return {
            message: 'Address updated successfully',
            data: await this.customersService.updateAddress(customerId, addressId, dto),
        };
    }
    async deleteAddress(customerId, addressId) {
        return {
            message: 'Address deleted successfully',
            data: await this.customersService.deleteAddress(customerId, addressId),
        };
    }
    async getMeasurements(customerId) {
        return {
            message: 'Measurement profile retrieved successfully',
            data: await this.customersService.getMeasurements(customerId),
        };
    }
    async updateMeasurements(customerId, dto) {
        return {
            message: 'Measurement profile updated successfully',
            data: await this.customersService.updateMeasurements(customerId, dto),
        };
    }
};
__decorate([
    Get('me'),
    ApiOperation({ summary: 'Retrieve authenticated customer profile and addresses' }),
    __param(0, CurrentUser('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "getProfile", null);
__decorate([
    Patch('me'),
    ApiOperation({ summary: 'Update the authenticated customer profile' }),
    __param(0, CurrentUser('id')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateCustomerProfileDto]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "updateProfile", null);
__decorate([
    Get('me/dashboard'),
    ApiOperation({ summary: 'Retrieve a customer-safe account dashboard summary' }),
    __param(0, CurrentUser('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "getDashboard", null);
__decorate([
    Get('me/addresses'),
    ApiOperation({ summary: 'List the authenticated customer delivery addresses' }),
    __param(0, CurrentUser('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "findAddresses", null);
__decorate([
    Post('me/addresses'),
    ApiOperation({ summary: 'Create a delivery address for the authenticated customer' }),
    __param(0, CurrentUser('id')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, CreateAddressDto]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "createAddress", null);
__decorate([
    Patch('me/addresses/:id/default'),
    ApiOperation({ summary: 'Set one owned address as the default delivery address' }),
    __param(0, CurrentUser('id')),
    __param(1, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "setDefaultAddress", null);
__decorate([
    Patch('me/addresses/:id'),
    ApiOperation({ summary: 'Update an owned delivery address' }),
    __param(0, CurrentUser('id')),
    __param(1, Param('id')),
    __param(2, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, UpdateAddressDto]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "updateAddress", null);
__decorate([
    Delete('me/addresses/:id'),
    ApiOperation({ summary: 'Delete an owned delivery address' }),
    __param(0, CurrentUser('id')),
    __param(1, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "deleteAddress", null);
__decorate([
    Get('me/measurements'),
    ApiOperation({ summary: 'Retrieve the customer’s private measurement profile' }),
    __param(0, CurrentUser('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "getMeasurements", null);
__decorate([
    Put('me/measurements'),
    ApiOperation({ summary: 'Update the customer’s private measurement profile' }),
    __param(0, CurrentUser('id')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, MeasurementProfileDto]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "updateMeasurements", null);
CustomersController = __decorate([
    ApiTags('Customers'),
    ApiBearerAuth(),
    UseGuards(CustomerAuthGuard),
    Controller('customers'),
    __metadata("design:paramtypes", [CustomersService])
], CustomersController);
export { CustomersController };
//# sourceMappingURL=customers.controller.js.map