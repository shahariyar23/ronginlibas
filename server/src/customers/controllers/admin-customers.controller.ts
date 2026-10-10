import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CustomersService } from '../services/customers.service.js';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
import {
  CustomerQueryDto,
  UpdateCustomerStatusDto,
  PermanentDeleteCustomerDto,
} from '../dto/admin-customer.dto.js';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Permissions } from '../../common/decorators/permissions.decorator.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { UserRole } from '../../common/constants/roles.constant.js';
import type { AdminAuditActor } from '../../audit/audit.service.js';

@ApiTags('Admin - Customers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
@Permissions('customers')
@Controller('admin/customers')
export class AdminCustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  @ApiOperation({ summary: 'List clientele roster with pagination, status filter, and search' })
  async findAll(@Query() query: CustomerQueryDto) {
    const data = await this.customersService.findAll(query);
    return {
      message: 'Clientele roster retrieved successfully',
      data,
    };
  }

  @Get('archives')
  @ApiOperation({ summary: 'List permanently deleted customer archives & purchase snapshots' })
  async findAllArchives(@Query() query: PaginationQueryDto) {
    const data = await this.customersService.findAllArchives(query);
    return {
      message: 'Customer archives retrieved successfully',
      data,
    };
  }

  @Get('archives/:id')
  @ApiOperation({ summary: 'Retrieve specific customer archive snapshot and purchase history' })
  async findArchiveById(@Param('id') id: string) {
    const data = await this.customersService.findArchiveById(id);
    return {
      message: 'Customer archive snapshot retrieved successfully',
      data,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve specific customer profile and order history' })
  async findById(@Param('id') id: string) {
    const data = await this.customersService.findById(id);
    return {
      message: 'Customer details retrieved successfully',
      data,
    };
  }

  @Post(':id/reset-password')
  @ApiOperation({ summary: 'Send password reset link email to customer' })
  async sendPasswordResetLink(
    @Param('id') id: string,
    @CurrentUser() actor: AdminAuditActor,
  ) {
    return this.customersService.sendPasswordResetLink(id, actor);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Ban or activate customer with mandatory reason on ban' })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateCustomerStatusDto,
    @CurrentUser() actor: AdminAuditActor,
  ) {
    return this.customersService.updateStatus(id, dto, actor);
  }

  @Delete(':id/soft')
  @ApiOperation({ summary: 'Soft delete (archive) customer' })
  async softDelete(
    @Param('id') id: string,
    @CurrentUser() actor: AdminAuditActor,
  ) {
    return this.customersService.softDelete(id, actor);
  }

  @Post(':id/restore')
  @ApiOperation({ summary: 'Restore soft-deleted customer' })
  async restore(
    @Param('id') id: string,
    @CurrentUser() actor: AdminAuditActor,
  ) {
    return this.customersService.restore(id, actor);
  }

  @Delete(':id/permanent')
  @ApiOperation({
    summary:
      'Permanently delete customer with mandatory confirmation and purchase snapshot archive',
  })
  async permanentDelete(
    @Param('id') id: string,
    @Body() dto: PermanentDeleteCustomerDto,
    @CurrentUser() actor: AdminAuditActor,
  ) {
    return this.customersService.permanentDelete(id, dto, actor);
  }
}

