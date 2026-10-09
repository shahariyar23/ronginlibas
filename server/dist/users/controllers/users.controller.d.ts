import { UsersService } from '../services/users.service.js';
import { CreateUserDto } from '../dto/create-user.dto.js';
import { UpdateUserDto } from '../dto/update-user.dto.js';
import { ChangeUserPasswordDto } from '../dto/change-user-password.dto.js';
import { AuditService, type AdminAuditActor } from '../../audit/audit.service.js';
export declare class UsersController {
    private readonly usersService;
    private readonly auditService;
    constructor(usersService: UsersService, auditService: AuditService);
    create(dto: CreateUserDto, actor: AdminAuditActor): Promise<{
        message: string;
        data: {
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
        };
    }>;
    changePassword(userId: string, dto: ChangeUserPasswordDto, actor: AdminAuditActor): Promise<{
        message: string;
        data: {
            success: boolean;
            message: string;
        };
    }>;
    getMe(userId: string): Promise<{
        message: string;
        data: {
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
        };
    }>;
    findAll(): Promise<{
        message: string;
        data: {
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
        }[];
    }>;
    findById(id: string): Promise<{
        message: string;
        data: {
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
        };
    }>;
    update(id: string, dto: UpdateUserDto, currentUserId: string, actor: AdminAuditActor): Promise<{
        message: string;
        data: {
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
        };
    }>;
    delete(id: string, currentUserId: string, actor: AdminAuditActor): Promise<{
        message: string;
        data: {
            success: boolean;
            message: string;
        };
    }>;
}
