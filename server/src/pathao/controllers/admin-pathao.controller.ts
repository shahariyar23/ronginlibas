import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PathaoService } from '../services/pathao.service.js';
import { CalculatePriceDto } from '../dto/calculate-price.dto.js';
import { CreateSandboxOrderDto } from '../dto/create-sandbox-order.dto.js';
import { CreateParcelDto } from '../dto/create-parcel.dto.js';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Permissions } from '../../common/decorators/permissions.decorator.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { UserRole } from '../../common/constants/roles.constant.js';
import { AuditService, type AdminAuditActor } from '../../audit/audit.service.js';

@ApiTags('Admin - Pathao Courier Sandbox')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
@Permissions('orders', 'settings')
@Controller('admin/pathao')
export class AdminPathaoController {
  constructor(
    private readonly pathaoService: PathaoService,
    private readonly auditService: AuditService,
  ) {}

  @Get('test-connection')
  @ApiOperation({ summary: 'Test Pathao Sandbox OAuth connection and API responsiveness' })
  async testConnection(@CurrentUser() actor: AdminAuditActor) {
    const result = await this.pathaoService.testConnection();

    await this.auditService.record({
      actor,
      module: 'settings',
      action: 'PATHAO_SANDBOX_CONNECTION_TEST',
      entityType: 'pathao_sandbox',
      entityId: 'sandbox-test',
      summary: `Admin tested Pathao Sandbox connection: ${result.success ? 'SUCCESS' : 'FAILED'}`,
    });

    return result;
  }

  @Get('status')
  @ApiOperation({ summary: 'Get current Pathao Sandbox configuration status and stores' })
  async getStatus() {
    const data = await this.pathaoService.getStatus();
    return {
      success: true,
      data,
    };
  }

  @Get('cities')
  @ApiOperation({ summary: 'Fetch list of delivery cities from Pathao Sandbox' })
  async getCities() {
    const data = await this.pathaoService.getCities();
    return {
      success: true,
      data,
    };
  }

  @Get('cities/:cityId/zones')
  @ApiOperation({ summary: 'Fetch list of zones for a given city' })
  async getZones(@Param('cityId', ParseIntPipe) cityId: number) {
    const data = await this.pathaoService.getZones(cityId);
    return {
      success: true,
      data,
    };
  }

  @Get('zones/:zoneId/areas')
  @ApiOperation({ summary: 'Fetch list of areas for a given zone' })
  async getAreas(@Param('zoneId', ParseIntPipe) zoneId: number) {
    const data = await this.pathaoService.getAreas(zoneId);
    return {
      success: true,
      data,
    };
  }

  @Get('stores')
  @ApiOperation({ summary: 'Fetch merchant pickup stores from Pathao Sandbox' })
  async getStores() {
    const data = await this.pathaoService.getStores();
    return {
      success: true,
      data,
    };
  }

  @Post('price-plan')
  @ApiOperation({ summary: 'Calculate estimated courier fee on Pathao Sandbox' })
  async calculatePrice(@Body() dto: CalculatePriceDto) {
    const data = await this.pathaoService.calculatePrice(dto);
    return {
      success: true,
      data,
    };
  }

  @Post('test-orders')
  @ApiOperation({ summary: 'Create a standalone test order in Pathao Sandbox (no DB order link)' })
  async createTestOrder(
    @Body() dto: CreateSandboxOrderDto,
    @CurrentUser() actor: AdminAuditActor,
  ) {
    const data = await this.pathaoService.createSandboxOrder(dto);

    await this.auditService.record({
      actor,
      module: 'orders',
      action: 'PATHAO_SANDBOX_TEST_ORDER_CREATED',
      entityType: 'pathao_sandbox_order',
      entityId: data.consignment_id,
      entityLabel: data.merchant_order_id,
      summary: `Created test sandbox order: Consignment #${data.consignment_id}`,
      after: {
        consignmentId: data.consignment_id,
        merchantOrderId: data.merchant_order_id,
        orderStatus: data.order_status,
      },
    });

    return {
      success: true,
      message: 'Pathao sandbox test order created successfully',
      data,
    };
  }

  @Post('orders/:orderId/create-parcel')
  @ApiOperation({ summary: 'Book Pathao Sandbox parcel for an existing Rongin Libas order' })
  async createParcelFromOrder(
    @Param('orderId') orderId: string,
    @Body() options: CreateParcelDto,
    @CurrentUser() actor: AdminAuditActor,
  ) {
    const result = await this.pathaoService.createParcelFromOrder(orderId, options, actor);

    await this.auditService.record({
      actor,
      module: 'orders',
      action: 'PATHAO_SANDBOX_PARCEL_BOOKED',
      entityType: 'order',
      entityId: orderId,
      entityLabel: result.order.orderNumber,
      summary: `Booked Pathao Sandbox parcel #${result.parcel.consignment_id} for order ${result.order.orderNumber}`,
      after: {
        courierConsignmentId: result.parcel.consignment_id,
        courierStatus: result.order.courierStatus,
        courierStatusRaw: result.order.courierStatusRaw,
      },
    });

    return {
      success: true,
      message: `Pathao sandbox parcel #${result.parcel.consignment_id} created successfully`,
      data: result,
    };
  }

  @Get('orders/:orderId/track')
  @ApiOperation({ summary: 'Track consignment status from Pathao Sandbox' })
  async trackOrder(@Param('orderId') orderId: string) {
    const data = await this.pathaoService.refreshOrderStatus(orderId);
    return {
      success: true,
      data,
    };
  }

  @Post('orders/:orderId/refresh-status')
  @ApiOperation({ summary: 'Sync and update latest Pathao status for order' })
  async refreshOrderStatus(
    @Param('orderId') orderId: string,
    @CurrentUser() actor: AdminAuditActor,
  ) {
    const data = await this.pathaoService.refreshOrderStatus(orderId);

    await this.auditService.record({
      actor,
      module: 'orders',
      action: 'PATHAO_SANDBOX_STATUS_SYNC',
      entityType: 'order',
      entityId: orderId,
      summary: `Synced Pathao status for ${data.orderNumber}: ${data.courierStatus}`,
    });

    return {
      success: true,
      message: `Pathao status synced: ${data.courierStatus}`,
      data,
    };
  }
}
