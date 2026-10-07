import { ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard.js';

interface AuthenticatedCustomer {
  id: string;
  role: string;
  type: string;
}

@Injectable()
export class CustomerAuthGuard extends JwtAuthGuard {
  constructor(reflector: Reflector) {
    super(reflector);
  }

  handleRequest(err: unknown, user: AuthenticatedCustomer | undefined, info: unknown) {
    const authenticatedUser = super.handleRequest(err, user, info) as AuthenticatedCustomer;
    if (authenticatedUser.type !== 'customer' || authenticatedUser.role !== 'CUSTOMER') {
      throw new ForbiddenException('A customer account is required to access this resource');
    }
    return authenticatedUser;
  }
}
