import { UsersService } from '../services/users.service.js';
import { CreateUserDto } from '../dto/create-user.dto.js';
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
            isActive: boolean;
            createdAt: Date;
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
            isActive: boolean;
            createdAt: Date;
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
            isActive: boolean;
            createdAt: Date;
        };
    }>;
}
