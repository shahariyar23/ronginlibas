import { UserRole } from '../../common/constants/roles.constant.js';
export declare class UpdateUserDto {
    email?: string;
    password?: string;
    firstName?: string;
    lastName?: string;
    role?: UserRole;
    permissions?: string[];
    isActive?: boolean;
    mustChangePassword?: boolean;
}
