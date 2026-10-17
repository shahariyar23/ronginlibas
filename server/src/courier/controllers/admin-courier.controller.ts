import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ShipmentService } from '../services/shipment.service.js';
import { CreateShipmentDto } from '../dto/create-shipment.dto.js';
import { CreateReturnRequestDto } from '../dto/create-return-request.dto.js';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Permissions } from '../../common/decorators/permissions.decorator.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { UserRole } from '../../common/constants/roles.constant.js';
import { AuditService, type AdminAuditActor } from '../../audit/audit.service.js';

@ApiTags('Admin - Courier Logistics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
@Permissions('orders')
@Controller('admin')
export class AdminCourierController {
  constructor(
    private readonly shipmentService: ShipmentService,
    private readonly auditService: AuditService,
  ) {}

  @Get('courier/health')
  @ApiOperation({ summary: 'Health check for courier logistics integration' })
  async healthCheck() {
    const data = await this.shipmentService.healthCheck();
    return {
      success: true,
      data,
    };
  }

  @Get('courier/balance')
  @ApiOperation({ summary: 'Fetch merchant account balance from active courier provider' })
  async getBalance() {
    const data = await this.shipmentService.getBalance();
    return {
      success: true,
      data,
    };
  }

  @Post('orders/:orderId/shipment')
  @ApiOperation({ summary: 'Create parcel shipment for an order with active courier provider' })
  async createShipment(
    @Param('orderId') orderId: string,
    @Body() dto: CreateShipmentDto,
    @CurrentUser() actor: AdminAuditActor,
  ) {
    const data = await this.shipmentService.createShipmentForOrder(orderId, dto, actor);

    await this.auditService.record({
      actor,
      module: 'orders',
      action: 'COURIER_SHIPMENT_CREATED',
      entityType: 'shipment',
      entityId: data.id,
      entityLabel: data.orderNumber,
      summary: `Created ${data.provider} shipment #${data.consignmentId || data.id} for order ${data.orderNumber} (Tracking: ${data.trackingCode})`,
      after: {
        provider: data.provider,
        consignmentId: data.consignmentId,
        trackingCode: data.trackingCode,
        codAmount: data.codAmount,
        status: data.status,
      },
    });

    return {
      success: true,
      message: `Shipment booked successfully with ${data.provider}. Consignment #${data.consignmentId}`,
      data,
    };
  }

  @Get('orders/:orderId/shipment')
  @ApiOperation({ summary: 'Retrieve shipment details and audit trail for an order' })
  async getShipment(@Param('orderId') orderId: string) {
    const data = await this.shipmentService.getShipmentByOrderId(orderId);
    return {
      success: true,
      data,
    };
  }

  @Post('orders/:orderId/shipment/refresh-status')
  @ApiOperation({ summary: 'Sync latest delivery status from courier gateway' })
  async refreshStatus(
    @Param('orderId') orderId: string,
    @CurrentUser() actor: AdminAuditActor,
  ) {
    const data = await this.shipmentService.refreshShipmentStatus(orderId, actor);

    await this.auditService.record({
      actor,
      module: 'orders',
      action: 'COURIER_STATUS_SYNC',
      entityType: 'shipment',
      entityId: data.id,
      entityLabel: data.orderNumber,
      summary: `Synced courier status for order ${data.orderNumber}: ${data.providerStatus} (${data.status})`,
      after: {
        status: data.status,
        providerStatus: data.providerStatus,
        lastSyncedAt: data.lastSyncedAt,
      },
    });

    return {
      success: true,
      message: `Courier status synced: ${data.providerStatus}`,
      data,
    };
  }

  @Post('orders/:orderId/shipment/return')
  @ApiOperation({ summary: 'Book courier return request for an order consignment' })
  async createReturnRequest(
    @Param('orderId') orderId: string,
    @Body() dto: CreateReturnRequestDto,
    @CurrentUser() actor: AdminAuditActor,
  ) {
    const data = await this.shipmentService.createReturnRequest(orderId, dto, actor);

    await this.auditService.record({
      actor,
      module: 'orders',
      action: 'COURIER_RETURN_REQUESTED',
      entityType: 'order',
      entityId: orderId,
      summary: `Requested courier return: ${dto.reason || 'Doorstep return'}`,
    });

    return {
      success: data.success,
      message: data.message,
      data,
    };
  }

  @Get('courier/status-by-cid/:consignmentId')
  @ApiOperation({ summary: 'Look up live status by courier consignment ID' })
  async getStatusByCid(@Param('consignmentId') consignmentId: string) {
    const data = await this.shipmentService.getStatusByConsignmentId(consignmentId);
    return {
      success: true,
      data,
    };
  }

  @Get('courier/status-by-invoice/:invoice')
  @ApiOperation({ summary: 'Look up live status by provider invoice number' })
  async getStatusByInvoice(@Param('invoice') invoice: string) {
    const data = await this.shipmentService.getStatusByInvoice(invoice);
    return {
      success: true,
      data,
    };
  }

  @Get('courier/status-by-tracking/:trackingCode')
  @ApiOperation({ summary: 'Look up live status by tracking code' })
  async getStatusByTrackingCode(@Param('trackingCode') trackingCode: string) {
    const data = await this.shipmentService.getStatusByTrackingCode(trackingCode);
    return {
      success: true,
      data,
    };
  }
}
