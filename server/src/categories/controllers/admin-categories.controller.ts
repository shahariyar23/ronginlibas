import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CategoriesService } from '../services/categories.service.js';
import { CreateCategoryDto } from '../dto/create-category.dto.js';
import { UpdateCategoryDto } from '../dto/update-category.dto.js';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Permissions } from '../../common/decorators/permissions.decorator.js';
import { UserRole } from '../../common/constants/roles.constant.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { AuditService, type AdminAuditActor } from '../../audit/audit.service.js';

@ApiTags('Admin - Categories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
@Permissions('categories')
@Controller('admin/categories')
export class AdminCategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly auditService: AuditService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all categories with products count' })
  async findAll() {
    const data = await this.categoriesService.findAll(true);
    return {
      message: 'Admin categories retrieved successfully',
      data,
    };
  }

  @Post()
  @ApiOperation({ summary: 'Create new apparel category' })
  async create(
    @Body() dto: CreateCategoryDto,
    @CurrentUser() actor: AdminAuditActor,
  ) {
    const data = await this.categoriesService.create(dto);
    await this.auditService.record({
      actor,
      module: 'categories',
      action: 'CATEGORY_CREATED',
      entityType: 'category',
      entityId: data.id,
      entityLabel: data.name,
      summary: `Created category ${data.name}`,
      after: data,
    });
    return {
      message: 'Category created successfully',
      data,
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an existing category' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
    @CurrentUser() actor: AdminAuditActor,
  ) {
    const data = await this.categoriesService.update(id, dto);
    await this.auditService.record({
      actor,
      module: 'categories',
      action: 'CATEGORY_UPDATED',
      entityType: 'category',
      entityId: data.id,
      entityLabel: data.name,
      summary: `Updated category ${data.name}`,
      after: data,
    });
    return {
      message: 'Category updated successfully',
      data,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a category' })
  async delete(
    @Param('id') id: string,
    @CurrentUser() actor: AdminAuditActor,
  ) {
    const result = await this.categoriesService.remove(id);
    await this.auditService.record({
      actor,
      module: 'categories',
      action: 'CATEGORY_DELETED',
      entityType: 'category',
      entityId: id,
      summary: `Deleted category ${id}`,
    });
    return result;
  }
}

