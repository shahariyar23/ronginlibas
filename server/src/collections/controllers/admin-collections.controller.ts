import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CollectionsService } from '../services/collections.service.js';
import { CreateCollectionDto } from '../dto/create-collection.dto.js';
import { UpdateCollectionDto } from '../dto/update-collection.dto.js';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Permissions } from '../../common/decorators/permissions.decorator.js';
import { UserRole } from '../../common/constants/roles.constant.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { AuditService, type AdminAuditActor } from '../../audit/audit.service.js';

@ApiTags('Admin - Collections')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
@Permissions('collections', 'categories', 'products')
@Controller('admin/collections')
export class AdminCollectionsController {
  constructor(
    private readonly collectionsService: CollectionsService,
    private readonly auditService: AuditService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all collections with linked products count' })
  async findAll() {
    const data = await this.collectionsService.findAll(true);
    return {
      message: 'Admin collections retrieved successfully',
      data,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve collection details with assigned products' })
  async findById(@Param('id') id: string) {
    const data = await this.collectionsService.findById(id);
    return {
      message: 'Collection details retrieved successfully',
      data,
    };
  }

  @Post()
  @ApiOperation({ summary: 'Create new product collection' })
  async create(
    @Body() dto: CreateCollectionDto,
    @CurrentUser() actor: AdminAuditActor,
  ) {
    const data = await this.collectionsService.create(dto);
    await this.auditService.record({
      actor,
      module: 'collections',
      action: 'COLLECTION_CREATED',
      entityType: 'collection',
      entityId: data.id,
      entityLabel: data.name,
      summary: `Created collection "${data.name}"`,
      after: data,
    });
    return {
      message: 'Collection created successfully',
      data,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update collection details and product links' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCollectionDto,
    @CurrentUser() actor: AdminAuditActor,
  ) {
    const before = await this.collectionsService.findById(id).catch(() => null);
    const data = await this.collectionsService.update(id, dto);
    await this.auditService.record({
      actor,
      module: 'collections',
      action: 'COLLECTION_UPDATED',
      entityType: 'collection',
      entityId: data.id,
      entityLabel: data.name,
      summary: `Updated collection "${data.name}"`,
      before,
      after: data,
    });
    return {
      message: 'Collection updated successfully',
      data,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Safe delete collection' })
  async delete(
    @Param('id') id: string,
    @CurrentUser() actor: AdminAuditActor,
  ) {
    const before = await this.collectionsService.findById(id).catch(() => null);
    const data = await this.collectionsService.delete(id);
    await this.auditService.record({
      actor,
      module: 'collections',
      action: 'COLLECTION_DELETED',
      entityType: 'collection',
      entityId: id,
      entityLabel: before?.name || id,
      summary: `Deleted collection "${before?.name || id}"`,
      before,
    });
    return {
      message: 'Collection deleted successfully',
      data,
    };
  }
}
