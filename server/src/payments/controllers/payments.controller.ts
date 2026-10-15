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
import { UddoktaPaymentService } from '../services/uddokta-payment.service.js';
import { Public } from '../../common/decorators/public.decorator.js';
import { CreatePaymentDto } from '../dto/payment-request.dto.js';
import { VerifyPaymentDto, VerifyUddoktaPaymentDto } from '../dto/verify-payment.dto.js';
import { InitiateWaitmarkPaymentDto } from '../dto/initiate-waitmark-payment.dto.js';
import { InitiateUddoktaPaymentDto } from '../dto/initiate-uddokta-payment.dto.js';
import { UddoktaWebhookPayloadDto } from '../dto/payment-webhook.dto.js';
import { OptionalCustomerAuthGuard } from '../../auth/guards/optional-customer-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';

@ApiTags('Payments')
@Public()
@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly waitmarkService: WaitmarkPaymentService,
    private readonly uddoktaService: UddoktaPaymentService,
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

  // ==========================================
  // UDDOKTAPAY HOSTED PAYMENT GATEWAY ENDPOINTS
  // ==========================================

  @Post('uddoktapay/initiate')
  @UseGuards(OptionalCustomerAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Initiate UddoktaPay hosted payment session for an order' })
  async initiateUddokta(
    @Body() dto: InitiateUddoktaPaymentDto,
    @CurrentUser() requester?: any,
  ) {
    const data = await this.uddoktaService.initiatePayment(dto, requester);
    return {
      success: true,
      message: 'UddoktaPay checkout session created successfully',
      data,
    };
  }

  @Post('uddoktapay/verify')
  @ApiOperation({ summary: 'Verify UddoktaPay payment server-side via invoice ID' })
  async verifyUddokta(@Body() dto: VerifyUddoktaPaymentDto) {
    const data = await this.uddoktaService.verifyPayment(dto.invoiceId, dto.orderId);
    return {
      success: true,
      message: data.message,
      data,
    };
  }

  @Post('uddoktapay/webhook')
  @ApiOperation({ summary: 'Receive and verify official UddoktaPay IPN webhook' })
  async uddoktaWebhook(
    @Req() req: Request,
    @Body() body: UddoktaWebhookPayloadDto,
  ) {
    const result = await this.uddoktaService.processWebhook(req.headers, body);
    return {
      success: true,
      message: result.message,
      idempotent: result.idempotent,
    };
  }

  @Get('uddoktapay/redirect')
  @ApiOperation({ summary: 'Handle customer return redirect from UddoktaPay hosted checkout' })
  async uddoktaRedirect(
    @Query('invoice_id') invoiceId?: string,
    @Query('order_id') orderId?: string,
    @Res() res?: Response,
  ) {
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') ||
      this.configService.get<string>('WEB_FRONTEND_URL') ||
      'http://localhost:3000';

    let resolvedOrderId = orderId;

    if (invoiceId) {
      try {
        const verifyRes = await this.uddoktaService.verifyPayment(invoiceId, orderId);
        if (verifyRes.orderNumber) {
          resolvedOrderId = verifyRes.orderNumber;
        }
      } catch {
        // Safe: non-blocking on redirect, frontend will query authoritative status
      }
    }

    const redirectUrl = `${frontendUrl.replace(/\/+$/, '')}/payment/result?orderId=${encodeURIComponent(
      resolvedOrderId || orderId || '',
    )}${invoiceId ? `&invoice_id=${encodeURIComponent(invoiceId)}` : ''}`;

    return res ? res.redirect(redirectUrl) : { redirectUrl };
  }

  @Get('uddoktapay/cancel')
  @ApiOperation({ summary: 'Handle customer cancellation redirect from UddoktaPay checkout' })
  async uddoktaCancelRedirect(
    @Query('order_id') orderId?: string,
    @Res() res?: Response,
  ) {
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') ||
      this.configService.get<string>('WEB_FRONTEND_URL') ||
      'http://localhost:3000';

    if (orderId) {
      try {
        await this.uddoktaService.handleFailedPayment(
          orderId,
          'Payment cancelled by customer at UddoktaPay checkout',
        );
      } catch {
        // Safe non-blocking
      }
    }

    const redirectUrl = `${frontendUrl.replace(/\/+$/, '')}/payment/result?orderId=${encodeURIComponent(
      orderId || '',
    )}&status=cancelled`;

    return res ? res.redirect(redirectUrl) : { redirectUrl };
  }

  @Post('uddoktapay/cancel')
  @UseGuards(OptionalCustomerAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel/Delete an unpaid UddoktaPay order and restore inventory stock' })
  async cancelUddoktaPayment(
    @Body('orderId') orderId: string,
    @CurrentUser() _requester?: any,
  ) {
    if (!orderId) {
      return { success: false, message: 'orderId is required' };
    }
    const result = await this.uddoktaService.handleFailedPayment(
      orderId,
      'Payment cancelled by customer at checkout / result page',
    );
    return {
      success: true,
      message: result.message,
    };
  }

  // ==========================================
  // WAITMARK PAY PAYMENT GATEWAY ENDPOINTS
  // ==========================================

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
    @Query('status') status?: string,
    @Res() res?: Response,
  ) {
    const frontendUrl =
      this.configService.get<string>('WEB_FRONTEND_URL') ||
      this.configService.get<string>('FRONTEND_URL') ||
      'http://localhost:3000';

    const cleanStatus = status?.trim().toLowerCase();
    const isExplicitFailure =
      cleanStatus &&
      ['failed', 'cancelled', 'cancel', 'declined', 'rejected', 'expired', 'error'].includes(
        cleanStatus,
      );

    if (orderId && isExplicitFailure) {
      try {
        await this.waitmarkService.handleFailedPayment(
          orderId,
          `Gateway browser redirect reported status: ${status}`,
        );
      } catch (err: any) {
        // Log and proceed to redirect
      }
    }

    const redirectUrl = `${frontendUrl.replace(/\/+$/, '')}/payment/result?orderId=${encodeURIComponent(
      orderId || '',
    )}${trxId ? `&trx_id=${encodeURIComponent(trxId)}` : ''}${
      cleanStatus ? `&status=${encodeURIComponent(cleanStatus)}` : ''
    }`;

    return res ? res.redirect(redirectUrl) : { redirectUrl };
  }

  @Post('waitmark/cancel')
  @UseGuards(OptionalCustomerAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel/Delete an unpaid Waitmark Pay order and restore inventory stock' })
  async cancelWaitmarkPayment(
    @Body('orderId') orderId: string,
    @CurrentUser() _requester?: any,
  ) {
    if (!orderId) {
      return { success: false, message: 'orderId is required' };
    }
    const result = await this.waitmarkService.handleFailedPayment(
      orderId,
      'Payment cancelled by customer at checkout / result page',
    );
    return {
      success: true,
      message: result.message,
    };
  }

  // ==========================================
  // SHARED & LEGACY PAYMENT ENDPOINTS
  // ==========================================

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
        dto.provider as any,
        customerId,
        dto.phone,
        dto.trackingToken,
      ),
    };
  }

  @Post('verify')
  @ApiOperation({ summary: 'Verify a payment through its configured gateway provider' })
  async verify(@Body() dto: VerifyPaymentDto) {
    if (dto.invoiceId) {
      const data = await this.uddoktaService.verifyPayment(dto.invoiceId, dto.orderId);
      return {
        message: data.message,
        data,
      };
    }
    return {
      message: 'Payment verification requested',
      data: await this.paymentsService.verifyPayment(),
    };
  }

  @Post('webhook/:provider')
  @ApiOperation({ summary: 'Receive a signed gateway payment webhook' })
  async webhook(
    @Param('provider') provider: string,
    @Req() req: Request,
    @Body() body: any,
  ) {
    const cleanProvider = (provider || '').trim().toLowerCase();
    if (cleanProvider === 'uddoktapay') {
      const result = await this.uddoktaService.processWebhook(req.headers, body);
      return {
        success: true,
        message: result.message,
        idempotent: result.idempotent,
      };
    }
    return {
      message: 'Payment webhook received',
      data: await this.paymentsService.handleWebhook(),
    };
  }
}
