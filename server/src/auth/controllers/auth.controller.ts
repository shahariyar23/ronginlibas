import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service.js';
import { LoginDto } from '../dto/login.dto.js';
import { RegisterCustomerDto } from '../dto/register.dto.js';
import { RefreshTokenDto } from '../dto/refresh-token.dto.js';
import { Public } from '../../common/decorators/public.decorator.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../guards/jwt-auth.guard.js';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('admin/login')
  @ApiOperation({ summary: 'Authenticate admin dashboard user' })
  async adminLogin(@Body() dto: LoginDto) {
    const data = await this.authService.adminLogin(dto);
    return {
      message: 'Admin authenticated successfully',
      data,
    };
  }

  @Public()
  @Post('customer/login')
  @ApiOperation({ summary: 'Authenticate storefront customer' })
  async customerLogin(@Body() dto: LoginDto) {
    const data = await this.authService.customerLogin(dto);
    return {
      message: 'Customer authenticated successfully',
      data,
    };
  }

  @Public()
  @Post('customer/register')
  @ApiOperation({ summary: 'Register a new customer account' })
  async registerCustomer(@Body() dto: RegisterCustomerDto) {
    const data = await this.authService.registerCustomer(dto);
    return {
      message: 'Patron registered successfully',
      data,
    };
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'Rotate expired access token using refresh token' })
  async refreshTokens(@Body() dto: RefreshTokenDto) {
    const data = await this.authService.refreshTokens(dto);
    return {
      message: 'Tokens refreshed successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('me')
  @ApiOperation({ summary: 'Retrieve currently authenticated session details' })
  async getMe(@CurrentUser() user: any) {
    return {
      message: 'Session retrieved successfully',
      data: user,
    };
  }
}
