import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateUserDto } from '../dto/create-user.dto.js';
import { UpdateUserDto } from '../dto/update-user.dto.js';
import { ChangeUserPasswordDto } from '../dto/change-user-password.dto.js';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateUserDto): Promise<{
        email: string;
        firstName: string;
        lastName: string;
        id: string;
        role: import("@prisma/client").$Enums.Role;
        permissions: string[];
        isActive: boolean;
        mustChangePassword: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(): Promise<{
        email: string;
        firstName: string;
        lastName: string;
        id: string;
        role: import("@prisma/client").$Enums.Role;
        permissions: string[];
        isActive: boolean;
        mustChangePassword: boolean;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findById(id: string): Promise<{
        email: string;
        firstName: string;
        lastName: string;
        id: string;
        role: import("@prisma/client").$Enums.Role;
        permissions: string[];
        isActive: boolean;
        mustChangePassword: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, dto: UpdateUserDto, currentUserId?: string): Promise<{
        email: string;
        firstName: string;
        lastName: string;
        id: string;
        role: import("@prisma/client").$Enums.Role;
        permissions: string[];
        isActive: boolean;
        mustChangePassword: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    delete(id: string, currentUserId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    changePassword(userId: string, dto: ChangeUserPasswordDto): Promise<{
        success: boolean;
        message: string;
    }>;
}
