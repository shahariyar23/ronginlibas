var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ForbiddenException, Injectable, UnauthorizedException, } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
let OptionalCustomerAuthGuard = class OptionalCustomerAuthGuard extends AuthGuard('jwt') {
    canActivate(context) {
        const request = context.switchToHttp().getRequest();
        if (!request.headers.authorization)
            return true;
        return super.canActivate(context);
    }
    handleRequest(err, user, _info, _context, _status) {
        if (err)
            throw err;
        if (!user)
            return undefined;
        if (!isAuthenticatedCustomer(user)) {
            throw new UnauthorizedException('The access token is invalid');
        }
        if (user.type !== 'customer' || user.role !== 'CUSTOMER') {
            throw new ForbiddenException('A customer account is required to access this resource');
        }
        return user;
    }
};
OptionalCustomerAuthGuard = __decorate([
    Injectable()
], OptionalCustomerAuthGuard);
export { OptionalCustomerAuthGuard };
function isAuthenticatedCustomer(value) {
    return (typeof value === 'object' &&
        value !== null &&
        'id' in value &&
        typeof value.id === 'string' &&
        'type' in value &&
        typeof value.type === 'string' &&
        'role' in value &&
        typeof value.role === 'string');
}
//# sourceMappingURL=optional-customer-auth.guard.js.map