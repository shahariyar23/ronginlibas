import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service.js';
export interface JwtPayload {
    sub: string;
    email?: string;
    role: string;
    type: 'admin' | 'customer';
    permissions?: string[];
}
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly prisma;
    constructor(configService: ConfigService, prisma: PrismaService);
    validate(payload: JwtPayload): Promise<{
        id: string;
        sub: string;
        email: string;
        role: import("@prisma/client").$Enums.Role;
        firstName: string;
        lastName: string;
        permissions: string[];
        type: "admin";
    } | {
        id: string;
        sub: string;
        email: string | undefined;
        role: string;
        permissions: never[];
        type: "customer";
        firstName?: undefined;
        lastName?: undefined;
    }>;
}
export {};
