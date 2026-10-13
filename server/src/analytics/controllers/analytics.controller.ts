import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AnalyticsService } from '../services/analytics.service.js';
import {
  TrackEventsBatchDto,
  UpdateConsentDto,
} from '../dto/track-event.dto.js';
import { OptionalCustomerAuthGuard } from '../../auth/guards/optional-customer-auth.guard.js';

interface RequestWithOptionalUser extends Request {
  user?: {
    id: string;
    role: string;
    type: string;
  };
}

@ApiTags('Analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('events')
  @HttpCode(HttpStatus.OK)
  @UseGuards(OptionalCustomerAuthGuard)
  @ApiOperation({ summary: 'Ingest client-side e-commerce behavior tracking events' })
  @ApiResponse({ status: 200, description: 'Events accepted or processed according to consent' })
  async trackEvents(
    @Body() dto: TrackEventsBatchDto,
    @Req() req: RequestWithOptionalUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    const customerId = req.user?.type === 'customer' ? req.user.id : undefined;
    return this.analyticsService.trackEvents(dto, req, res, customerId);
  }

  @Post('consent')
  @HttpCode(HttpStatus.OK)
  @UseGuards(OptionalCustomerAuthGuard)
  @ApiOperation({ summary: 'Update visitor analytics and marketing consent preferences' })
  @ApiResponse({ status: 200, description: 'Consent recorded successfully' })
  async updateConsent(
    @Body() dto: UpdateConsentDto,
    @Req() req: RequestWithOptionalUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    const customerId = req.user?.type === 'customer' ? req.user.id : undefined;
    return this.analyticsService.updateConsent(dto, req, res, customerId);
  }

  @Post('identify')
  @HttpCode(HttpStatus.OK)
  @UseGuards(OptionalCustomerAuthGuard)
  @ApiOperation({ summary: 'Associate anonymous visitor profile with authenticated customer account' })
  @ApiResponse({ status: 200, description: 'Visitor linked successfully' })
  async identify(
    @Req() req: RequestWithOptionalUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    const customerId = req.user?.type === 'customer' ? req.user.id : undefined;
    return this.analyticsService.identify(req, res, customerId);
  }

  @Get('visitor')
  @UseGuards(OptionalCustomerAuthGuard)
  @ApiOperation({ summary: 'Resolve current visitor identity token and consent status' })
  @ApiResponse({ status: 200, description: 'Visitor context details' })
  async getVisitorStatus(
    @Req() req: RequestWithOptionalUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    const customerId = req.user?.type === 'customer' ? req.user.id : undefined;
    return this.analyticsService.getVisitorStatus(req, res, customerId);
  }
}
