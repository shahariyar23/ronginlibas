import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PaymentsService } from '../services/payments.service.js';
import { Public } from '../../common/decorators/public.decorator.js';

@ApiTags('Payments (Prepared)')
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
}
