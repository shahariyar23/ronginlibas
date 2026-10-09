import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InventoryService } from '../services/inventory.service.js';
import { AdjustStockDto } from '../dto/adjust-stock.dto.js';
import { InventoryQueryDto } from '../dto/inventory-query.dto.js';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Permissions } from '../../common/decorators/permissions.decorator.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { UserRole } from '../../common/constants/roles.constant.js';

@ApiTags('Admin - Inventory')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
@Permissions('inventory')
@Controller('admin/inventory')
export class AdminInventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  @ApiOperation({ summary: 'List inventory stock levels across all garment variants' })
  async getInventoryList(@Query() query: InventoryQueryDto) {
    const data = await this.inventoryService.getInventoryList(query);
    return {
      message: 'Inventory ledger retrieved successfully',
      data,
    };
  }

  @Post('adjust')
  @ApiOperation({ summary: 'Perform stock count adjustment with audit transaction log' })
  async adjustStock(@Body() dto: AdjustStockDto, @CurrentUser('id') userId?: string) {
    const data = await this.inventoryService.adjustStock(dto, userId);
    return {
      message: 'Stock adjusted and audit transaction logged successfully',
      data,
    };
  }

  @Get(':variantId/history')
  @ApiOperation({ summary: 'Retrieve full inventory transaction history for a variant' })
  async getTransactionHistory(@Param('variantId') variantId: string) {
    const data = await this.inventoryService.getTransactionHistory(variantId);
    return {
      message: 'Transaction history retrieved successfully',
      data,
    };
  }
}
