import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateUserDto } from '../dto/create-user.dto.js';
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
          firstName: dto.firstName,
          lastName: dto.lastName,
          role: (dto.role ?? UserRole.MANAGER) as Role,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          createdAt: true,
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
        isActive: true,
        createdAt: true,
      },
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
        isActive: true,
        createdAt: true,
      },
    });
    if (!user) throw new NotFoundException('Staff user not found');
    return user;
  }
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  );
}
