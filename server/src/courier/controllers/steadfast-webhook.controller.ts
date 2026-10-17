import {
  Controller,
  Post,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ShipmentService } from '../services/shipment.service.js';
import { SteadfastWebhookDto } from '../dto/steadfast-webhook.dto.js';

@ApiTags('Webhooks - Steadfast Courier')
@Controller('webhooks/steadfast')
export class SteadfastWebhookController {
  private readonly logger = new Logger(SteadfastWebhookController.name);

  constructor(private readonly shipmentService: ShipmentService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Receive asynchronous delivery status webhooks from Steadfast Courier' })
  @ApiResponse({ status: 200, description: 'Webhook acknowledged and processed successfully' })
  async handleWebhook(
    @Body() payload: SteadfastWebhookDto,
    @Headers() headers: Record<string, string | string[] | undefined>,
  ) {
    this.logger.log('[Steadfast Webhook Endpoint] Delivery status webhook received');
    return this.shipmentService.processWebhook(payload, headers);
  }
}
