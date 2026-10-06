import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateUserDto } from '../dto/create-user.dto.js';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateUserDto): Promise<{
        email: string;
        firstName: string;
        lastName: string;
        id: string;
        role: import("@prisma/client").$Enums.Role;
        isActive: boolean;
        createdAt: Date;
    }>;
    findAll(): Promise<{
        email: string;
        firstName: string;
        lastName: string;
        id: string;
        role: import("@prisma/client").$Enums.Role;
        isActive: boolean;
        createdAt: Date;
    }[]>;
    findById(id: string): Promise<{
        email: string;
        firstName: string;
        lastName: string;
        id: string;
        role: import("@prisma/client").$Enums.Role;
        isActive: boolean;
        createdAt: Date;
    }>;
}
