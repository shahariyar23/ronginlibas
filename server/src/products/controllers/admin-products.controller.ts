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
import { ProductsService } from '../services/products.service.js';
import { CreateProductDto } from '../dto/create-product.dto.js';
import { UpdateProductDto } from '../dto/update-product.dto.js';
import { ProductQueryDto } from '../dto/product-query.dto.js';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { UserRole } from '../../common/constants/roles.constant.js';
import { Permissions } from '../../common/decorators/permissions.decorator.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { AuditService, AdminAuditActor } from '../../audit/audit.service.js';

@ApiTags('Admin - Products')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
@Permissions('products')
@Controller('admin/products')
export class AdminProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly auditService: AuditService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all products with admin filters, stock states, and SKUs' })
  async findAll(@Query() query: ProductQueryDto) {
    const data = await this.productsService.findAll(query, true);
    return {
      message: 'Admin products retrieved successfully',
      data,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve full garment specifications and variant matrix by ID or slug' })
  async findById(@Param('id') id: string) {
    const data = await this.productsService.findById(id);
    return {
      message: 'Product specifications retrieved successfully',
      data,
    };
  }

  @Post()
  @ApiOperation({ summary: 'Create new garment silhouette with variants and lookbook media' })
  async create(@Body() dto: CreateProductDto, @CurrentUser() actor: AdminAuditActor) {
    const data = await this.productsService.create(dto);
    await this.auditService.record({
      actor,
      module: 'products',
      action: 'PRODUCT_CREATED',
      entityType: 'product',
      entityId: data.id,
      entityLabel: data.name,
      summary: `Created product ${data.name}`,
      after: data,
    });
    return {
      message: 'Product created successfully',
      data,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update product specifications or variants' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
    @CurrentUser() actor: AdminAuditActor,
  ) {
    const before = await this.productsService.findById(id);
    const data = await this.productsService.update(id, dto);
    await this.auditService.record({
      actor,
      module: 'products',
      action: 'PRODUCT_UPDATED',
      entityType: 'product',
      entityId: data.id,
      entityLabel: data.name,
      summary: `Updated product ${data.name}`,
      before,
      after: data,
    });
    return {
      message: 'Product updated successfully',
      data,
    };
  }

  @Patch(':id/archive')
  @ApiOperation({ summary: 'Archive product (hide from customer storefront, preserve inventory & media)' })
  async archive(@Param('id') id: string, @CurrentUser() actor: AdminAuditActor) {
    const before = await this.productsService.findById(id);
    const res = await this.productsService.archive(id);
    await this.auditService.record({
      actor,
      module: 'products',
      action: 'PRODUCT_ARCHIVED',
      entityType: 'product',
      entityId: before.id,
      entityLabel: before.name,
      summary: `Archived product ${before.name}`,
      before: { isActive: before.isActive, deletedAt: before.deletedAt },
      after: res.data,
    });
    return {
      message: res.message,
      data: res.data,
    };
  }

  @Patch(':id/restore')
  @ApiOperation({ summary: 'Restore an archived product to active catalog' })
  async restore(@Param('id') id: string, @CurrentUser() actor: AdminAuditActor) {
    const before = await this.productsService.findById(id);
    const res = await this.productsService.restore(id);
    await this.auditService.record({
      actor,
      module: 'products',
      action: 'PRODUCT_RESTORED',
      entityType: 'product',
      entityId: before.id,
      entityLabel: before.name,
      summary: `Restored product ${before.name}`,
      before: { isActive: before.isActive, deletedAt: before.deletedAt },
      after: res.data,
    });
    return {
      message: res.message,
      data: res.data,
    };
  }

  @Delete(':id/permanent')
  @ApiOperation({ summary: 'Permanently remove product from database and cleanup Cloudinary media assets' })
  async deletePermanent(@Param('id') id: string, @CurrentUser() actor: AdminAuditActor) {
    const before = await this.productsService.findById(id);
    const res = await this.productsService.delete(id);
    await this.auditService.record({
      actor,
      module: 'products',
      action: 'PRODUCT_DELETED',
      entityType: 'product',
      entityId: before.id,
      entityLabel: before.name,
      summary: `Permanently deleted product ${before.name}`,
      before,
    });
    return {
      message: res.message,
      data: res.data,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Permanently remove product from database and cleanup Cloudinary media assets' })
  async delete(@Param('id') id: string, @CurrentUser() actor: AdminAuditActor) {
    const before = await this.productsService.findById(id);
    const res = await this.productsService.delete(id);
    await this.auditService.record({
      actor,
      module: 'products',
      action: 'PRODUCT_DELETED',
      entityType: 'product',
      entityId: before.id,
      entityLabel: before.name,
      summary: `Permanently deleted product ${before.name}`,
      before,
    });
    return {
      message: res.message,
      data: res.data,
    };
  }
}
