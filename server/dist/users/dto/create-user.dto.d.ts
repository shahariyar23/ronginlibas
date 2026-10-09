import { UserRole } from '../../common/constants/roles.constant.js';
export declare class CreateUserDto {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: UserRole;
    permissions?: string[];
    mustChangePassword?: boolean;
}
