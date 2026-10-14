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
        role: import("@prisma/client").$Enums.Role;
        mustChangePassword: boolean;
        createdAt: Date;
        id: string;
        permissions: string[];
        isActive: boolean;
        updatedAt: Date;
    }>;
    findAll(): Promise<{
        email: string;
        firstName: string;
        lastName: string;
        role: import("@prisma/client").$Enums.Role;
        mustChangePassword: boolean;
        createdAt: Date;
        id: string;
        permissions: string[];
        isActive: boolean;
        updatedAt: Date;
    }[]>;
    findById(id: string): Promise<{
        email: string;
        firstName: string;
        lastName: string;
        role: import("@prisma/client").$Enums.Role;
        mustChangePassword: boolean;
        createdAt: Date;
        id: string;
        permissions: string[];
        isActive: boolean;
        updatedAt: Date;
    }>;
    update(id: string, dto: UpdateUserDto, currentUserId?: string): Promise<{
        email: string;
        firstName: string;
        lastName: string;
        role: import("@prisma/client").$Enums.Role;
        mustChangePassword: boolean;
        createdAt: Date;
        id: string;
        permissions: string[];
        isActive: boolean;
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
