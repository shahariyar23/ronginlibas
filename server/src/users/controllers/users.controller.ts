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
import { UsersService } from '../services/users.service.js';
import { CreateUserDto } from '../dto/create-user.dto.js';
import { UpdateUserDto } from '../dto/update-user.dto.js';
import { ChangeUserPasswordDto } from '../dto/change-user-password.dto.js';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Permissions } from '../../common/decorators/permissions.decorator.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { UserRole } from '../../common/constants/roles.constant.js';
import { AuditService, AdminAuditActor } from '../../audit/audit.service.js';

@ApiTags('Admin - Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly auditService: AuditService,
  ) {}

  @Roles(UserRole.SUPER_ADMIN)
  @Post()
  @ApiOperation({ summary: 'Create new administrative staff member' })
  async create(
    @Body() dto: CreateUserDto,
    @CurrentUser() actor: AdminAuditActor,
  ) {
    const data = await this.usersService.create(dto);
    await this.auditService.record({
      actor,
      module: 'staff',
      action: 'STAFF_CREATED',
      entityType: 'staff',
      entityId: data.id,
      entityLabel: `${data.firstName} ${data.lastName}`,
      summary: `Created staff account for ${data.email}`,
      after: data,
    });
    return {
      message: 'Staff user created successfully',
      data,
    };
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
  @Patch('me/change-password')
  @ApiOperation({ summary: 'Change password for currently authenticated staff or admin' })
  async changePassword(
    @CurrentUser('sub') userId: string,
    @Body() dto: ChangeUserPasswordDto,
    @CurrentUser() actor: AdminAuditActor,
  ) {
    const data = await this.usersService.changePassword(userId, dto);
    await this.auditService.record({
      actor,
      module: 'staff',
      action: 'STAFF_PASSWORD_CHANGED',
      entityType: 'staff',
      entityId: userId,
      entityLabel: actor.email,
      summary: 'Changed own staff account password',
    });
    return {
      message: 'Password updated successfully',
      data,
    };
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
  @Get('me')
  @ApiOperation({ summary: 'Retrieve currently authenticated staff user profile and permissions' })
  async getMe(@CurrentUser('sub') userId: string) {
    const data = await this.usersService.findById(userId);
    return {
      message: 'Staff profile retrieved successfully',
      data,
    };
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Permissions('staff')
  @Get()
  @ApiOperation({ summary: 'List all administrative staff users' })
  async findAll() {
    const data = await this.usersService.findAll();
    return {
      message: 'Staff users retrieved successfully',
      data,
    };
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Permissions('staff')
  @Get(':id')
  @ApiOperation({ summary: 'Retrieve staff user by ID' })
  async findById(@Param('id') id: string) {
    const data = await this.usersService.findById(id);
    return {
      message: 'Staff user retrieved successfully',
      data,
    };
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Patch(':id')
  @ApiOperation({ summary: 'Update staff member details, role, permissions or status' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser('sub') currentUserId: string,
    @CurrentUser() actor: AdminAuditActor,
  ) {
    const before = await this.usersService.findById(id);
    const data = await this.usersService.update(id, dto, currentUserId);
    await this.auditService.record({
      actor,
      module: 'staff',
      action: dto.password ? 'STAFF_PASSWORD_RESET' : 'STAFF_UPDATED',
      entityType: 'staff',
      entityId: data.id,
      entityLabel: `${data.firstName} ${data.lastName}`,
      summary: dto.password
        ? `Reset password for ${data.email}`
        : `Updated staff account for ${data.email}`,
      before,
      after: data,
    });
    return {
      message: 'Staff user updated successfully',
      data,
    };
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete staff member' })
  async delete(
    @Param('id') id: string,
    @CurrentUser('sub') currentUserId: string,
    @CurrentUser() actor: AdminAuditActor,
  ) {
    const before = await this.usersService.findById(id);
    const data = await this.usersService.delete(id, currentUserId);
    await this.auditService.record({
      actor,
      module: 'staff',
      action: 'STAFF_DELETED',
      entityType: 'staff',
      entityId: id,
      entityLabel: `${before.firstName} ${before.lastName}`,
      summary: `Deleted staff account for ${before.email}`,
      before,
    });
    return {
      message: 'Staff user deleted successfully',
      data,
    };
  }
}
