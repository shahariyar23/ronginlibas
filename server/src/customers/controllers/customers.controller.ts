import { Body, Controller, Delete, Get, Param, Patch, Post, Put, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CustomersService } from '../services/customers.service.js';
import { CustomerAuthGuard } from '../../auth/guards/customer-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { Public } from '../../common/decorators/public.decorator.js';
import { UpdateCustomerProfileDto } from '../dto/update-customer-profile.dto.js';
import { CreateAddressDto, UpdateAddressDto } from '../dto/address.dto.js';
import { MeasurementProfileDto } from '../dto/measurement-profile.dto.js';

@ApiTags('Customers')
@ApiBearerAuth()
@UseGuards(CustomerAuthGuard)
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Retrieve authenticated customer profile and addresses' })
  async getProfile(@CurrentUser('id') customerId: string) {
    const data = await this.customersService.findMyProfile(customerId);
    return {
      message: 'Profile retrieved successfully',
      data,
    };
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update the authenticated customer profile' })
  async updateProfile(
    @CurrentUser('id') customerId: string,
    @Body() dto: UpdateCustomerProfileDto,
  ) {
    return {
      message: 'Profile updated successfully',
      data: await this.customersService.updateMyProfile(customerId, dto),
    };
  }

  @Get('me/dashboard')
  @ApiOperation({ summary: 'Retrieve a customer-safe account dashboard summary' })
  async getDashboard(@CurrentUser('id') customerId: string) {
    return {
      message: 'Customer dashboard retrieved successfully',
      data: await this.customersService.getDashboard(customerId),
    };
  }

  @Get('me/addresses')
  @ApiOperation({ summary: 'List the authenticated customer delivery addresses' })
  async findAddresses(@CurrentUser('id') customerId: string) {
    return {
      message: 'Addresses retrieved successfully',
      data: await this.customersService.findAddresses(customerId),
    };
  }

  @Post('me/addresses')
  @ApiOperation({ summary: 'Create a delivery address for the authenticated customer' })
  async createAddress(
    @CurrentUser('id') customerId: string,
    @Body() dto: CreateAddressDto,
  ) {
    return {
      message: 'Address created successfully',
      data: await this.customersService.createAddress(customerId, dto),
    };
  }

  @Patch('me/addresses/:id/default')
  @ApiOperation({ summary: 'Set one owned address as the default delivery address' })
  async setDefaultAddress(
    @CurrentUser('id') customerId: string,
    @Param('id') addressId: string,
  ) {
    return {
      message: 'Default address updated successfully',
      data: await this.customersService.setDefaultAddress(customerId, addressId),
    };
  }

  @Patch('me/addresses/:id')
  @ApiOperation({ summary: 'Update an owned delivery address' })
  async updateAddress(
    @CurrentUser('id') customerId: string,
    @Param('id') addressId: string,
    @Body() dto: UpdateAddressDto,
  ) {
    return {
      message: 'Address updated successfully',
      data: await this.customersService.updateAddress(customerId, addressId, dto),
    };
  }

  @Delete('me/addresses/:id')
  @ApiOperation({ summary: 'Delete an owned delivery address' })
  async deleteAddress(
    @CurrentUser('id') customerId: string,
    @Param('id') addressId: string,
  ) {
    return {
      message: 'Address deleted successfully',
      data: await this.customersService.deleteAddress(customerId, addressId),
    };
  }

  @Get('me/measurements')
  @ApiOperation({ summary: 'Retrieve the customer’s private measurement profile' })
  async getMeasurements(@CurrentUser('id') customerId: string) {
    return {
      message: 'Measurement profile retrieved successfully',
      data: await this.customersService.getMeasurements(customerId),
    };
  }

  @Put('me/measurements')
  @ApiOperation({ summary: 'Update the customer’s private measurement profile' })
  async updateMeasurements(
    @CurrentUser('id') customerId: string,
    @Body() dto: MeasurementProfileDto,
  ) {
    return {
      message: 'Measurement profile updated successfully',
      data: await this.customersService.updateMeasurements(customerId, dto),
    };
  }

  @Delete('me')
  @ApiOperation({ summary: 'Permanently delete the authenticated customer profile and linked social identities' })
  async deleteMyAccount(
    @CurrentUser('id') customerId: string,
    @Body('reason') reason?: string,
  ) {
    const result = await this.customersService.deleteMyAccount(customerId, reason);
    return {
      message: 'Your account and personal data have been deleted successfully.',
      data: result,
    };
  }

  @Public()
  @Post('data-deletion-request')
  @ApiOperation({ summary: 'Public endpoint to submit a data deletion request (Compliance)' })
  async submitDataDeletionRequest(
    @Body() dto: { email: string; phone?: string; reason?: string },
  ) {
    const result = await this.customersService.submitPublicDataDeletionRequest(dto);
    return {
      message: 'Data deletion request processed.',
      data: result,
    };
  }
}
