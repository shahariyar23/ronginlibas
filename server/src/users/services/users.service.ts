import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateUserDto } from '../dto/create-user.dto.js';
import { UpdateUserDto } from '../dto/update-user.dto.js';
import { ChangeUserPasswordDto } from '../dto/change-user-password.dto.js';
import { UserRole } from '../../common/constants/roles.constant.js';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      select: { id: true },
    });
    if (existing) {
      throw new ConflictException('A staff user with this email already exists');
    }

    try {
      return await this.prisma.user.create({
        data: {
          email: dto.email.toLowerCase(),
          passwordHash: await bcrypt.hash(dto.password, 10),
          firstName: dto.firstName.trim(),
          lastName: dto.lastName.trim(),
          role: (dto.role ?? UserRole.MANAGER) as Role,
          permissions: dto.permissions ?? [],
          mustChangePassword: dto.mustChangePassword ?? true,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          permissions: true,
          isActive: true,
          mustChangePassword: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new ConflictException('A staff user with this email already exists');
      }
      throw error;
    }
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        permissions: true,
        isActive: true,
        mustChangePassword: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        permissions: true,
        isActive: true,
        mustChangePassword: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) throw new NotFoundException('Staff user not found');
    return user;
  }

  async update(id: string, dto: UpdateUserDto, currentUserId?: string) {
    const existing = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException('Staff user not found');

    if (dto.email && dto.email.toLowerCase() !== existing.email) {
      const emailTaken = await this.prisma.user.findUnique({
        where: { email: dto.email.toLowerCase() },
      });
      if (emailTaken) {
        throw new ConflictException('A user with this email already exists');
      }
    }

    // Protect primary super admin from being deactivated or demoted
    if (existing.email === 'admin@ronginlibas.com') {
      if (dto.isActive === false) {
        throw new ForbiddenException('Primary Super Admin cannot be deactivated');
      }
      if (dto.role && dto.role !== UserRole.SUPER_ADMIN) {
        throw new ForbiddenException('Primary Super Admin role cannot be changed');
      }
    }

    const updateData: Prisma.UserUpdateInput = {};
    if (dto.firstName !== undefined) updateData.firstName = dto.firstName.trim();
    if (dto.lastName !== undefined) updateData.lastName = dto.lastName.trim();
    if (dto.email !== undefined) updateData.email = dto.email.toLowerCase();
    if (dto.role !== undefined) updateData.role = dto.role as Role;
    if (dto.permissions !== undefined) updateData.permissions = dto.permissions;
    if (dto.isActive !== undefined) updateData.isActive = dto.isActive;
    if (dto.mustChangePassword !== undefined) updateData.mustChangePassword = dto.mustChangePassword;

    if (dto.password) {
      updateData.passwordHash = await bcrypt.hash(dto.password, 10);
      updateData.refreshTokenHash = null;
    }

    return this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        permissions: true,
        isActive: true,
        mustChangePassword: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async delete(id: string, currentUserId: string) {
    if (id === currentUserId) {
      throw new BadRequestException('You cannot delete your own account');
    }

    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Staff user not found');

    if (user.email === 'admin@ronginlibas.com') {
      throw new ForbiddenException('Primary Super Admin cannot be deleted');
    }

    await this.prisma.user.delete({ where: { id } });
    return { success: true, message: 'Staff user deleted successfully' };
  }

  async changePassword(userId: string, dto: ChangeUserPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw new NotFoundException('User not found');

    // If current password provided or user has changed password before, verify current password
    if (dto.currentPassword) {
      const isMatch = await bcrypt.compare(dto.currentPassword, user.passwordHash);
      if (!isMatch) {
        throw new BadRequestException('The current password entered is incorrect');
      }
    } else if (!user.mustChangePassword) {
      throw new BadRequestException('Current password is required to change password');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash,
        mustChangePassword: false,
        refreshTokenHash: null,
      },
    });

    return { success: true, message: 'Password updated successfully' };
  }
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  );
}
