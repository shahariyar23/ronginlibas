import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { OptionalCustomerAuthGuard } from '../auth/guards/optional-customer-auth.guard.js';
import { CartIdentityDto, AddCartItemDto, UpdateCartItemDto } from './dto/cart-item.dto.js';
import { CartService } from './cart.service.js';

@ApiTags('Cart')
@UseGuards(OptionalCustomerAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  @ApiOperation({ summary: 'Create or retrieve a guest or customer cart' })
  async openCart(@CurrentUser('id') customerId: string | undefined, @Body() dto: CartIdentityDto) {
    return { message: 'Cart ready', data: await this.cartService.openCart(customerId, dto.cartId) };
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve cart items and server-calculated totals' })
  async getCart(
    @CurrentUser('id') customerId: string | undefined,
    @Query() query: CartIdentityDto,
  ) {
    return { message: 'Cart retrieved successfully', data: await this.cartService.getCart(customerId, query.cartId) };
  }

  @Post('items')
  @ApiOperation({ summary: 'Add a current database-priced variant to the cart' })
  async addItem(@CurrentUser('id') customerId: string | undefined, @Body() dto: AddCartItemDto) {
    return {
      message: 'Cart item added successfully',
      data: await this.cartService.addItem(customerId, dto.cartId, dto.variantId, dto.quantity),
    };
  }

  @Patch('items/:itemId')
  @ApiOperation({ summary: 'Update a cart item quantity' })
  async updateItem(
    @CurrentUser('id') customerId: string | undefined,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return {
      message: 'Cart item updated successfully',
      data: await this.cartService.updateItem(customerId, dto.cartId, itemId, dto.quantity),
    };
  }

  @Delete('items/:itemId')
  @ApiOperation({ summary: 'Remove an item from the owned cart' })
  async removeItem(
    @CurrentUser('id') customerId: string | undefined,
    @Param('itemId') itemId: string,
    @Query() query: CartIdentityDto,
  ) {
    return {
      message: 'Cart item removed successfully',
      data: await this.cartService.removeItem(customerId, query.cartId, itemId),
    };
  }

  @Delete()
  @ApiOperation({ summary: 'Remove all items from the owned cart' })
  async clearCart(
    @CurrentUser('id') customerId: string | undefined,
    @Query() query: CartIdentityDto,
  ) {
    return {
      message: 'Cart emptied successfully',
      data: await this.cartService.clearCart(customerId, query.cartId),
    };
  }
}

@ApiTags('Cart')
@ApiBearerAuth()
@UseGuards(OptionalCustomerAuthGuard)
@Controller('cart')
export class CartMergeController {
  constructor(private readonly cartService: CartService) {}

  @Post('merge')
  @ApiOperation({ summary: 'Merge a guest cart into the signed-in customer cart' })
  async merge(@CurrentUser('id') customerId: string | undefined, @Body() dto: CartIdentityDto) {
    if (!customerId) {
      throw new UnauthorizedException('Customer authentication is required to merge a cart');
    }
    return {
      message: 'Cart merged successfully',
      data: await this.cartService.mergeGuestCart(customerId, dto.cartId ?? ''),
    };
  }
}
