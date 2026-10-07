var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard.js';
let CustomerAuthGuard = class CustomerAuthGuard extends JwtAuthGuard {
    constructor(reflector) {
        super(reflector);
    }
    handleRequest(err, user, info) {
        const authenticatedUser = super.handleRequest(err, user, info);
        if (authenticatedUser.type !== 'customer' || authenticatedUser.role !== 'CUSTOMER') {
            throw new ForbiddenException('A customer account is required to access this resource');
        }
        return authenticatedUser;
    }
};
CustomerAuthGuard = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [Reflector])
], CustomerAuthGuard);
export { CustomerAuthGuard };
//# sourceMappingURL=customer-auth.guard.js.map