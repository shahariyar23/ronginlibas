import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Permissions } from '../common/decorators/permissions.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { UserRole } from '../common/constants/roles.constant.js';
import { AdminAuditActor } from '../audit/audit.service.js';
import { CartService } from './cart.service.js';
import { AdminCartQueryDto, SendCartReminderDto } from './dto/cart-item.dto.js';

@ApiTags('Admin - Abandoned Carts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
@Permissions('orders')
@Controller('admin/carts')
export class AdminCartsController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'List customer & guest shopping carts with item breakdown' })
  async getCarts(@Query() query: AdminCartQueryDto) {
    const data = await this.cartService.getAdminCarts(query);
    return {
      message: 'Admin carts stream retrieved successfully',
      data,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve specific cart details and items' })
  async getCartById(@Param('id') id: string) {
    const data = await this.cartService.getAdminCartById(id);
    return {
      message: 'Cart details retrieved successfully',
      data,
    };
  }

  @Post(':id/send-reminder')
  @ApiOperation({ summary: 'Send abandoned cart recovery awareness email to patron' })
  async sendReminder(
    @Param('id') id: string,
    @Body() dto: SendCartReminderDto,
    @CurrentUser() user: any,
  ) {
    const actor: AdminAuditActor = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    };

    const data = await this.cartService.sendCartReminder(id, dto.customMessage, actor);
    return {
      message: `Abandoned cart awareness email sent successfully to ${data.email}`,
      data,
    };
  }
}
