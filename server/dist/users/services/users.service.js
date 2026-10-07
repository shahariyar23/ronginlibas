var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service.js';
import { UserRole } from '../../common/constants/roles.constant.js';
let UsersService = class UsersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
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
                    role: (dto.role ?? UserRole.MANAGER),
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
        }
        catch (error) {
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
    async findById(id) {
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
        if (!user)
            throw new NotFoundException('Staff user not found');
        return user;
    }
};
UsersService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService])
], UsersService);
export { UsersService };
function isUniqueConstraintError(error) {
    return (error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002');
}
//# sourceMappingURL=users.service.js.map