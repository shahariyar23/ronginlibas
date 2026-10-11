import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateUserDto } from '../dto/create-user.dto.js';
import { UpdateUserDto } from '../dto/update-user.dto.js';
import { ChangeUserPasswordDto } from '../dto/change-user-password.dto.js';
import { MailService } from '../../mail/mail.service.js';
export declare class UsersService {
    private readonly prisma;
    private readonly mailService;
    private readonly logger;
    constructor(prisma: PrismaService, mailService: MailService);
    create(dto: CreateUserDto): Promise<{
        email: string;
        firstName: string;
        lastName: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        role: import("@prisma/client").$Enums.Role;
        permissions: string[];
        mustChangePassword: boolean;
    }>;
    findAll(): Promise<{
        email: string;
        firstName: string;
        lastName: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        role: import("@prisma/client").$Enums.Role;
        permissions: string[];
        mustChangePassword: boolean;
    }[]>;
    findById(id: string): Promise<{
        email: string;
        firstName: string;
        lastName: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        role: import("@prisma/client").$Enums.Role;
        permissions: string[];
        mustChangePassword: boolean;
    }>;
    update(id: string, dto: UpdateUserDto, currentUserId?: string): Promise<{
        email: string;
        firstName: string;
        lastName: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        role: import("@prisma/client").$Enums.Role;
        permissions: string[];
        mustChangePassword: boolean;
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
