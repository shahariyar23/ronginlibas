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
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            role: import("@prisma/client").$Enums.Role;
            permissions: string[];
            mustChangePassword: boolean;
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
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            role: import("@prisma/client").$Enums.Role;
            permissions: string[];
            mustChangePassword: boolean;
        };
    }>;
    findAll(): Promise<{
        message: string;
        data: {
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
        }[];
    }>;
    findById(id: string): Promise<{
        message: string;
        data: {
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
        };
    }>;
    update(id: string, dto: UpdateUserDto, currentUserId: string, actor: AdminAuditActor): Promise<{
        message: string;
        data: {
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
