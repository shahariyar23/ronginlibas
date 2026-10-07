import { ExecutionContext } from '@nestjs/common';
declare const OptionalCustomerAuthGuard_base: import("@nestjs/passport").Type<import("@nestjs/passport").IAuthGuard>;
export declare class OptionalCustomerAuthGuard extends OptionalCustomerAuthGuard_base {
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | import("rxjs").Observable<boolean>;
    handleRequest(err: any, user: any, _info: any, _context: ExecutionContext, _status?: any): any;
}
export {};
