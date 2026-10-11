import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OffersService } from '../services/offers.service.js';
import { CreateOfferDto } from '../dto/create-offer.dto.js';
import { QueryAdminOffersDto } from '../dto/query-offers.dto.js';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Permissions } from '../../common/decorators/permissions.decorator.js';
import { UserRole } from '../../common/constants/roles.constant.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { type AdminAuditActor } from '../../audit/audit.service.js';

@ApiTags('Admin - Offers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
@Permissions('offers', 'coupons', 'products')
@Controller('admin/offers')
export class AdminOffersController {
  constructor(private readonly offersService: OffersService) {}

  @Get()
  @ApiOperation({ summary: 'List all promotional offers with status calculation' })
  async findAll(@Query() query: QueryAdminOffersDto) {
    const data = await this.offersService.getAdminOffers(query);
    return {
      message: 'Promotional offers retrieved successfully',
      data,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get offer details by ID' })
  async findOne(@Param('id') id: string) {
    const data = await this.offersService.getAdminOfferById(id);
    return {
      message: 'Offer details retrieved successfully',
      data,
    };
  }

  @Post()
  @ApiOperation({ summary: 'Create new promotional offer campaign' })
  async create(
    @Body() dto: CreateOfferDto,
    @CurrentUser() actor: AdminAuditActor,
  ) {
    const data = await this.offersService.createOffer(dto, actor);
    return {
      message: 'Offer campaign created successfully',
      data,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update promotional offer campaign properties' })
  async update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateOfferDto>,
    @CurrentUser() actor: AdminAuditActor,
  ) {
    const data = await this.offersService.updateOffer(id, dto, actor);
    return {
      message: 'Offer campaign updated successfully',
      data,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete promotional offer campaign' })
  async remove(
    @Param('id') id: string,
    @CurrentUser() actor: AdminAuditActor,
  ) {
    const data = await this.offersService.deleteOffer(id, actor);
    return {
      message: data.message,
    };
  }
}
