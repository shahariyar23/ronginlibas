import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { AuthProvider } from '@prisma/client';
import { AuthService } from '../services/auth.service.js';
import { LoginDto } from '../dto/login.dto.js';
import { RegisterCustomerDto } from '../dto/register.dto.js';
import { RefreshTokenDto } from '../dto/refresh-token.dto.js';
import { SocialLoginDto } from '../dto/social-login.dto.js';
import {
  ChangePasswordDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from '../dto/password-reset.dto.js';
import { Public } from '../../common/decorators/public.decorator.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../guards/jwt-auth.guard.js';
import { CustomerAuthGuard } from '../guards/customer-auth.guard.js';

const REFRESH_COOKIE = 'rongin_libas_refresh';
const REFRESH_COOKIE_PATH = '/api/v1/auth/refresh';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Post('admin/login')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: 'Authenticate an admin dashboard user' })
  async adminLogin(@Body() dto: LoginDto) {
    return {
      message: 'Admin authenticated successfully',
      data: await this.authService.adminLogin(dto),
    };
  }

  @Public()
  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: 'Authenticate a customer and set the refresh cookie' })
  async customerLogin(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.loginCustomer(dto, response);
  }

  @Public()
  @Post('customer/login')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: 'Legacy customer login route' })
  async legacyCustomerLogin(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.loginCustomer(dto, response);
  }

  @Public()
  @Post('register')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: 'Register a customer account' })
  async register(
    @Body() dto: RegisterCustomerDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const tokens = await this.authService.registerCustomer(dto);
    this.setRefreshCookie(response, tokens.refreshToken);
    const { refreshToken: _refreshToken, ...data } = tokens;
    return { message: 'Customer registered successfully', data };
  }

  @Public()
  @Post('customer/register')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: 'Legacy customer registration route' })
  async legacyRegister(
    @Body() dto: RegisterCustomerDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const tokens = await this.authService.registerCustomer(dto);
    this.setRefreshCookie(response, tokens.refreshToken);
    const { refreshToken: _refreshToken, ...data } = tokens;
    return { message: 'Customer registered successfully', data };
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'Rotate a refresh token from the secure cookie' })
  async refreshTokens(
    @Body() dto: RefreshTokenDto = {},
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = dto?.refreshToken ?? cookieValue(request.headers.cookie, REFRESH_COOKIE);
    if (!refreshToken) throw new UnauthorizedException('Refresh token is required');
    const tokens = await this.authService.refreshTokens(refreshToken);
    if (tokens.user.type === 'customer') {
      this.setRefreshCookie(response, tokens.refreshToken);
      const { refreshToken: _refreshToken, ...data } = tokens;
      return { message: 'Customer session refreshed successfully', data };
    }
    return { message: 'Admin session refreshed successfully', data: tokens };
  }

  @Post('logout')
  @UseGuards(CustomerAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke the current customer refresh session' })
  async logout(
    @CurrentUser('id') customerId: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authService.logoutCustomer(customerId);
    this.clearRefreshCookie(response);
    return { message: 'Customer session ended successfully', data: { loggedOut: true } };
  }

  @Public()
  @Post('forgot-password')
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  @ApiOperation({ summary: 'Request a password-reset email without disclosing account existence' })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return {
      message: 'If an account exists for that address, a reset link will be sent.',
      data: await this.authService.requestPasswordReset(dto.email),
    };
  }

  @Public()
  @Post('reset-password')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: 'Reset a password using a single-use time-limited token' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return {
      message: 'Password reset successfully',
      data: await this.authService.resetCustomerPassword(dto),
    };
  }

  @Post('change-password')
  @UseGuards(CustomerAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change the authenticated customer password' })
  async changePassword(
    @CurrentUser('id') customerId: string,
    @Body() dto: ChangePasswordDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const data = await this.authService.changeCustomerPassword(customerId, dto);
    this.clearRefreshCookie(response);
    return { message: 'Password changed successfully; sign in again to continue', data };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('me')
  @ApiOperation({ summary: 'Retrieve the current authenticated session identity' })
  async getMe(@CurrentUser() user: unknown) {
    return { message: 'Session retrieved successfully', data: user };
  }

  @Public()
  @Post('social')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiOperation({ summary: 'Authenticate customer using verified Firebase ID token (Google)' })
  async socialLogin(
    @Body() dto: SocialLoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const tokens = await this.authService.socialLogin(dto);
    this.setRefreshCookie(response, tokens.refreshToken);
    const { refreshToken: _refreshToken, ...data } = tokens;
    return { message: 'Customer authenticated successfully via social login', data };
  }

  @Post('social/link')
  @UseGuards(CustomerAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Link an additional social identity to the authenticated customer account' })
  async linkSocial(
    @CurrentUser('id') customerId: string,
    @Body() dto: SocialLoginDto,
  ) {
    const identity = await this.authService.linkSocialAccount(customerId, dto);
    return { message: 'Social account linked successfully', data: identity };
  }

  @Delete('social/unlink/:provider')
  @UseGuards(CustomerAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unlink a social identity from the authenticated customer account' })
  async unlinkSocial(
    @CurrentUser('id') customerId: string,
    @Param('provider') provider: AuthProvider,
  ) {
    const result = await this.authService.unlinkSocialAccount(customerId, provider);
    return { message: 'Social account unlinked successfully', data: result };
  }

  @Get('social/identities')
  @UseGuards(CustomerAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all connected authentication identities for the authenticated customer' })
  async getIdentities(@CurrentUser('id') customerId: string) {
    const identities = await this.authService.getCustomerIdentities(customerId);
    return { message: 'Identities retrieved successfully', data: identities };
  }

  private async loginCustomer(dto: LoginDto, response: Response) {
    const tokens = await this.authService.customerLogin(dto);
    this.setRefreshCookie(response, tokens.refreshToken);
    const { refreshToken: _refreshToken, ...data } = tokens;
    return { message: 'Customer authenticated successfully', data };
  }

  private setRefreshCookie(response: Response, token: string) {
    const production = this.configService.get<string>('app.nodeEnv') === 'production';
    response.cookie(REFRESH_COOKIE, token, {
      httpOnly: true,
      secure: production,
      sameSite: production ? 'none' : 'lax',
      path: REFRESH_COOKIE_PATH,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  private clearRefreshCookie(response: Response) {
    const production = this.configService.get<string>('app.nodeEnv') === 'production';
    response.clearCookie(REFRESH_COOKIE, {
      httpOnly: true,
      secure: production,
      sameSite: production ? 'none' : 'lax',
      path: REFRESH_COOKIE_PATH,
    });
  }
}

function cookieValue(cookieHeader: string | undefined, name: string): string | undefined {
  if (!cookieHeader) return undefined;
  for (const segment of cookieHeader.split(';')) {
    const [key, ...value] = segment.trim().split('=');
    if (key === name) {
      try {
        return decodeURIComponent(value.join('='));
      } catch {
        return undefined;
      }
    }
  }
  return undefined;
}
