import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from '../services/users.service.js';
import { CreateUserDto } from '../dto/create-user.dto.js';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { UserRole } from '../../common/constants/roles.constant.js';

@ApiTags('Admin - Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles(UserRole.SUPER_ADMIN)
  @Post()
  @ApiOperation({ summary: 'Create new administrative staff member' })
  async create(@Body() dto: CreateUserDto) {
    const data = await this.usersService.create(dto);
    return {
      message: 'Staff user created successfully',
      data,
    };
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Get()
  @ApiOperation({ summary: 'List all administrative staff users' })
  async findAll() {
    const data = await this.usersService.findAll();
    return {
      message: 'Staff users retrieved successfully',
      data,
    };
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Get(':id')
  @ApiOperation({ summary: 'Retrieve staff user by ID' })
  async findById(@Param('id') id: string) {
    const data = await this.usersService.findById(id);
    return {
      message: 'Staff user retrieved successfully',
      data,
    };
  }
}
