import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator.js';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator.js';
import { UserRole } from '../constants/roles.constant.js';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (
      (!requiredRoles || requiredRoles.length === 0) &&
      (!requiredPermissions || requiredPermissions.length === 0)
    ) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user || !user.role) {
      throw new ForbiddenException('Access denied. Authentication and role credentials required.');
    }

    // Super Admin has full, unrestricted clearance to all modules
    if (user.role === UserRole.SUPER_ADMIN) {
      return true;
    }

    // Role verification
    if (requiredRoles && requiredRoles.length > 0) {
      const hasRole = requiredRoles.includes(user.role);
      if (!hasRole) {
        throw new ForbiddenException(`Access forbidden. Required clearance role: ${requiredRoles.join(', ')}`);
      }
    }

    // Granular Module Permission verification
    if (requiredPermissions && requiredPermissions.length > 0) {
      const userPermissions: string[] = (user.permissions || []).map((p: string) => p.toLowerCase());
      const hasPermission = requiredPermissions.some((perm) =>
        userPermissions.includes(perm.toLowerCase()),
      );

      if (!hasPermission) {
        throw new ForbiddenException(
          `Access forbidden. You do not have permission to access the ${requiredPermissions.join(', ')} module.`,
        );
      }
    }

    return true;
  }
}
