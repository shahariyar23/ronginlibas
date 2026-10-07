import { Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CustomerAuthGuard } from '../auth/guards/customer-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { WishlistService } from './wishlist.service.js';

@ApiTags('Wishlist')
@ApiBearerAuth()
@UseGuards(CustomerAuthGuard)
@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  @ApiOperation({ summary: 'Retrieve the authenticated customer wishlist' })
  async findAll(@CurrentUser('id') customerId: string) {
    return {
      message: 'Wishlist retrieved successfully',
      data: await this.wishlistService.findAll(customerId),
    };
  }

  @Post('items/:productId')
  @ApiOperation({ summary: 'Save an active product to the wishlist' })
  async add(@CurrentUser('id') customerId: string, @Param('productId') productId: string) {
    return {
      message: 'Wishlist item added successfully',
      data: await this.wishlistService.add(customerId, productId),
    };
  }

  @Delete('items/:productId')
  @ApiOperation({ summary: 'Remove a product from the wishlist' })
  async remove(@CurrentUser('id') customerId: string, @Param('productId') productId: string) {
    return {
      message: 'Wishlist item removed successfully',
      data: await this.wishlistService.remove(customerId, productId),
    };
  }
}
