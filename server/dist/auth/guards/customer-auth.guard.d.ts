import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard.js';
interface AuthenticatedCustomer {
    id: string;
    role: string;
    type: string;
}
export declare class CustomerAuthGuard extends JwtAuthGuard {
    constructor(reflector: Reflector);
    handleRequest(err: unknown, user: AuthenticatedCustomer | undefined, info: unknown): AuthenticatedCustomer;
}
export {};
