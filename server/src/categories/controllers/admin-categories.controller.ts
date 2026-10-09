import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CategoriesService } from '../services/categories.service.js';
import { CreateCategoryDto } from '../dto/create-category.dto.js';
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
}
