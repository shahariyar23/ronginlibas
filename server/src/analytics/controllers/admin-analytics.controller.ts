import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Permissions } from '../../common/decorators/permissions.decorator.js';
import { UserRole } from '../../common/constants/roles.constant.js';
import { AnalyticsService } from '../services/analytics.service.js';
import { AnalyticsQueryDto } from '../dto/track-event.dto.js';

@ApiTags('Admin Analytics')
@ApiBearerAuth('bearer')
@Controller(['admin/analytics', 'analytics/admin'])
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
export class AdminAnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overview')
  @Permissions('reports')
  @ApiOperation({ summary: 'Get overview metrics, KPIs, and trend time series' })
  @ApiResponse({ status: 200, description: 'Overview metrics successfully calculated' })
  async getOverview(@Query() query: AnalyticsQueryDto) {
    return this.analyticsService.getOverview(query);
  }

  @Get('traffic')
  @Permissions('reports')
  @ApiOperation({ summary: 'Get traffic acquisition timeline, top referrers, and landing pages' })
  @ApiResponse({ status: 200, description: 'Traffic breakdown retrieved' })
  async getTraffic(@Query() query: AnalyticsQueryDto) {
    return this.analyticsService.getTraffic(query);
  }

  @Get('events')
  @Permissions('reports')
  @ApiOperation({ summary: 'Get paginated raw e-commerce events' })
  @ApiResponse({ status: 200, description: 'Event stream retrieved' })
  async getEvents(@Query() query: AnalyticsQueryDto) {
    return this.analyticsService.getEvents(query);
  }

  @Get('products')
  @Permissions('reports')
  @ApiOperation({ summary: 'Get product views, conversions, sizes, colors, and low-converting interest' })
  @ApiResponse({ status: 200, description: 'Product analytics retrieved' })
  async getProductAnalytics(@Query() query: AnalyticsQueryDto) {
    return this.analyticsService.getProductAnalytics(query);
  }

  @Get('conversions')
  @Permissions('reports')
  @ApiOperation({ summary: 'Get e-commerce conversion funnel progression and drop-offs' })
  @ApiResponse({ status: 200, description: 'Conversion funnel retrieved' })
  async getConversions(@Query() query: AnalyticsQueryDto) {
    return this.analyticsService.getFunnel(query);
  }

  @Get('funnel')
  @Permissions('reports')
  @ApiOperation({ summary: 'Get e-commerce conversion funnel progression and drop-offs' })
  @ApiResponse({ status: 200, description: 'Funnel analytics retrieved' })
  async getFunnel(@Query() query: AnalyticsQueryDto) {
    return this.analyticsService.getFunnel(query);
  }

  @Get('carts')
  @Permissions('reports')
  @ApiOperation({ summary: 'Get cart addition vs removal metrics and cart abandonment rates' })
  @ApiResponse({ status: 200, description: 'Cart analytics retrieved' })
  async getCarts(@Query() query: AnalyticsQueryDto) {
    return this.analyticsService.getCarts(query);
  }

  @Get('sessions')
  @Permissions('reports')
  @ApiOperation({ summary: 'Get paginated visitor sessions with duration and referral sources' })
  @ApiResponse({ status: 200, description: 'Visitor sessions retrieved' })
  async getSessions(@Query() query: AnalyticsQueryDto) {
    return this.analyticsService.getSessions(query);
  }

  @Get('top-pages')
  @Permissions('reports')
  @ApiOperation({ summary: 'Get most visited storefront pages and average engagement duration' })
  @ApiResponse({ status: 200, description: 'Top page paths retrieved' })
  async getTopPages(@Query() query: AnalyticsQueryDto) {
    return this.analyticsService.getTopPages(query);
  }

  @Get('searches')
  @Permissions('reports')
  @ApiOperation({ summary: 'Get customer product search queries and frequencies' })
  @ApiResponse({ status: 200, description: 'Search term analytics retrieved' })
  async getSearches(@Query() query: AnalyticsQueryDto) {
    return this.analyticsService.getSearches(query);
  }

  @Get('devices')
  @Permissions('reports')
  @ApiOperation({ summary: 'Get device category breakdown (Mobile, Desktop, Tablet)' })
  @ApiResponse({ status: 200, description: 'Device metrics retrieved' })
  async getDevices(@Query() query: AnalyticsQueryDto) {
    return this.analyticsService.getDevices(query);
  }

  @Get('customers/:customerId/activity')
  @Permissions('customers')
  @ApiOperation({ summary: 'Get authorized browsing and purchase activity timeline for a customer' })
  @ApiResponse({ status: 200, description: 'Customer activity timeline retrieved' })
  async getCustomerActivity(
    @Param('customerId') customerId: string,
    @Query() query: AnalyticsQueryDto,
  ) {
    return this.analyticsService.getCustomerActivity(customerId, query);
  }

  @Post('retention/cleanup')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Execute data retention purge for raw events and inactive sessions' })
  @ApiResponse({ status: 200, description: 'Retention purge executed' })
  async cleanupRetention(@Body('days') days?: number) {
    return this.analyticsService.cleanupRetention(days ? Number(days) : 180);
  }
}
