import { UsersService } from '../services/users.service.js';
import { CreateUserDto } from '../dto/create-user.dto.js';
import { UpdateUserDto } from '../dto/update-user.dto.js';
import { ChangeUserPasswordDto } from '../dto/change-user-password.dto.js';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(dto: CreateUserDto): Promise<{
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
    changePassword(userId: string, dto: ChangeUserPasswordDto): Promise<{
        message: string;
        data: {
            success: boolean;
            message: string;
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
    update(id: string, dto: UpdateUserDto, currentUserId: string): Promise<{
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
    delete(id: string, currentUserId: string): Promise<{
        message: string;
        data: {
            success: boolean;
            message: string;
        };
    }>;
}
