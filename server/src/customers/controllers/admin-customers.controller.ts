import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CustomersService } from '../services/customers.service.js';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { UserRole } from '../../common/constants/roles.constant.js';

@ApiTags('Admin - Customers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
@Controller('admin/customers')
export class AdminCustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  @ApiOperation({ summary: 'List clientele roster with pagination and search' })
  async findAll(@Query() query: PaginationQueryDto) {
    const data = await this.customersService.findAll(query);
    return {
      message: 'Clientele roster retrieved successfully',
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
}
