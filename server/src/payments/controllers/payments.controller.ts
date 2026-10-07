import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from '../services/payments.service.js';
import { Public } from '../../common/decorators/public.decorator.js';
import { CreatePaymentDto, VerifyPaymentDto } from '../dto/payment-request.dto.js';
import { OptionalCustomerAuthGuard } from '../../auth/guards/optional-customer-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';

@ApiTags('Payments')
@Public()
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('methods')
  @ApiOperation({ summary: 'List available regional payment gateways' })
  async getMethods() {
    const data = await this.paymentsService.getAvailableMethods();
    return {
      message: 'Payment methods retrieved successfully',
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
