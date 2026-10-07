import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

interface AuthenticatedCustomer {
  id: string;
  role: string;
  type: string;
}

@Injectable()
export class OptionalCustomerAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<{ headers: { authorization?: string } }>();
    if (!request.headers.authorization) return true;
    return super.canActivate(context);
  }

  handleRequest(
    err: any,
    user: any,
    _info: any,
    _context: ExecutionContext,
    _status?: any,
  ): any {
    if (err) throw err;
    if (!user) return undefined;
    if (!isAuthenticatedCustomer(user)) {
      throw new UnauthorizedException('The access token is invalid');
    }
    if (user.type !== 'customer' || user.role !== 'CUSTOMER') {
      throw new ForbiddenException('A customer account is required to access this resource');
    }
    return user;
  }
}

function isAuthenticatedCustomer(value: unknown): value is AuthenticatedCustomer {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    typeof value.id === 'string' &&
    'type' in value &&
    typeof value.type === 'string' &&
    'role' in value &&
    typeof value.role === 'string'
  );
}
