var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator.js';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator.js';
import { UserRole } from '../constants/roles.constant.js';
let RolesGuard = class RolesGuard {
    reflector;
    constructor(reflector) {
        this.reflector = reflector;
    }
    canActivate(context) {
        const requiredRoles = this.reflector.getAllAndOverride(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        const requiredPermissions = this.reflector.getAllAndOverride(PERMISSIONS_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if ((!requiredRoles || requiredRoles.length === 0) &&
            (!requiredPermissions || requiredPermissions.length === 0)) {
            return true;
        }
        const { user } = context.switchToHttp().getRequest();
        if (!user || !user.role) {
            throw new ForbiddenException('Access denied. Authentication and role credentials required.');
        }
        if (user.role === UserRole.SUPER_ADMIN) {
            return true;
        }
        if (requiredRoles && requiredRoles.length > 0) {
            const hasRole = requiredRoles.includes(user.role);
            if (!hasRole) {
                throw new ForbiddenException(`Access forbidden. Required clearance role: ${requiredRoles.join(', ')}`);
            }
        }
        if (requiredPermissions && requiredPermissions.length > 0) {
            const userPermissions = (user.permissions || []).map((p) => p.toLowerCase());
            const hasPermission = requiredPermissions.some((perm) => userPermissions.includes(perm.toLowerCase()));
            if (!hasPermission) {
                throw new ForbiddenException(`Access forbidden. You do not have permission to access the ${requiredPermissions.join(', ')} module.`);
            }
        }
        return true;
    }
};
RolesGuard = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [Reflector])
], RolesGuard);
export { RolesGuard };
//# sourceMappingURL=roles.guard.js.map