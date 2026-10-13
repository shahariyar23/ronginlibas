import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PathaoService } from '../services/pathao.service.js';

@ApiTags('Pathao Webhook')
@Controller('pathao/webhook')
export class PathaoWebhookController {
  private readonly logger = new Logger(PathaoWebhookController.name);

  constructor(private readonly pathaoService: PathaoService) {}

  @Get()
  @ApiOperation({ summary: 'Pathao Webhook health / ping endpoint' })
  healthCheck() {
    return {
      success: true,
      provider: 'Pathao',
      service: 'Rongin Libas Webhook Receiver',
      timestamp: new Date().toISOString(),
    };
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Receive live consignment status updates from Pathao Webhooks' })
  async handleWebhook(@Body() payload: Record<string, unknown>) {
    this.logger.log(
      `[Pathao Webhook Inbound] Received payload for consignment: ${payload?.consignment_id || 'N/A'}, status: ${payload?.order_status || payload?.order_status_slug || 'N/A'}`,
    );

    const result = await this.pathaoService.processWebhook(payload);
    return result;
  }
}
