import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { PaymentsService } from '../services/payments.service.js';
import { WaitmarkPaymentService } from '../services/waitmark-payment.service.js';
import { Public } from '../../common/decorators/public.decorator.js';
import { CreatePaymentDto, VerifyPaymentDto } from '../dto/payment-request.dto.js';
import { InitiateWaitmarkPaymentDto } from '../dto/initiate-waitmark-payment.dto.js';
import { OptionalCustomerAuthGuard } from '../../auth/guards/optional-customer-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';

@ApiTags('Payments')
@Public()
@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly waitmarkService: WaitmarkPaymentService,
    private readonly configService: ConfigService,
  ) {}

  @Get('methods')
  @ApiOperation({ summary: 'List available regional payment gateways' })
  async getMethods() {
    const data = await this.paymentsService.getAvailableMethods();
    return {
      message: 'Payment methods retrieved successfully',
      data,
    };
  }

  @Post('waitmark/initiate')
  @UseGuards(OptionalCustomerAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Initiate Waitmark Pay online payment session for an order' })
  async initiateWaitmark(
    @Body() dto: InitiateWaitmarkPaymentDto,
    @CurrentUser() requester?: any,
  ) {
    const data = await this.waitmarkService.initiatePayment(dto, requester);
    return {
      success: true,
      message: 'Waitmark Pay checkout session created successfully',
      data,
    };
  }

  @Post('waitmark/webhook')
  @ApiOperation({ summary: 'Receive and verify official Waitmark Pay HMAC webhook' })
  async waitmarkWebhook(
    @Req() req: Request,
    @Headers('x-waitmark-signature') sigHeader?: string,
    @Headers('X-Waitmark-Signature') sigHeaderUpper?: string,
    @Body() body?: unknown,
  ) {
    const signature = sigHeader || sigHeaderUpper;
    const rawBody =
      (req as any).rawBody ||
      (typeof body === 'string' ? Buffer.from(body) : Buffer.from(JSON.stringify(body || '')));

    const result = await this.waitmarkService.processWebhook(rawBody, signature);
    return {
      success: true,
      message: result.message,
      idempotent: result.idempotent,
    };
  }

  @Get('waitmark/webhook')
  @ApiOperation({ summary: 'Handle potential browser redirect from Waitmark Pay' })
  async waitmarkRedirect(
    @Query('order_id') orderId?: string,
    @Query('trx_id') trxId?: string,
    @Res() res?: Response,
  ) {
    const frontendUrl =
      this.configService.get<string>('WEB_FRONTEND_URL') || 'http://localhost:3000';
    const redirectUrl = `${frontendUrl.replace(/\/+$/, '')}/payment/result?orderId=${encodeURIComponent(
      orderId || '',
    )}${trxId ? `&trx_id=${encodeURIComponent(trxId)}` : ''}`;

    return res ? res.redirect(redirectUrl) : { redirectUrl };
  }

  @Get('status/:orderId')
  @UseGuards(OptionalCustomerAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Retrieve verified payment status and transaction history' })
  async getPaymentStatus(
    @Param('orderId') orderId: string,
    @CurrentUser() requester?: any,
    @Query('phone') phone?: string,
    @Query('trackingToken') trackingToken?: string,
  ) {
    const data = await this.waitmarkService.getPaymentStatus(
      orderId,
      requester,
      phone,
      trackingToken,
    );
    return {
      success: true,
      data,
    };
  }

  @Post('create')
  @UseGuards(OptionalCustomerAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Request an online payment session for an owned order' })
  async create(
    @Body() dto: CreatePaymentDto,
    @CurrentUser('id') customerId?: string,
  ) {
    return {
      message: 'Payment session requested',
      data: await this.paymentsService.createPayment(
        dto.orderNumber,
        dto.provider,
        customerId,
        dto.phone,
        dto.trackingToken,
      ),
    };
  }

  @Post('verify')
  @ApiOperation({ summary: 'Verify a payment through its configured gateway provider' })
  async verify(@Body() _dto: VerifyPaymentDto) {
    return {
      message: 'Payment verification requested',
      data: await this.paymentsService.verifyPayment(),
    };
  }

  @Post('webhook/:provider')
  @ApiOperation({ summary: 'Receive a signed gateway payment webhook' })
  async webhook(@Param('provider') _provider: string, @Body() _body: unknown) {
    return {
      message: 'Payment webhook received',
      data: await this.paymentsService.handleWebhook(),
    };
  }
}
