var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AuthService_1;
import { ConflictException, BadRequestException, Injectable, Logger, ServiceUnavailableException, UnauthorizedException, } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomBytes } from 'node:crypto';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import { PrismaService } from '../../prisma/prisma.service.js';
import { UserRole } from '../../common/constants/roles.constant.js';
let AuthService = AuthService_1 = class AuthService {
    prisma;
    jwtService;
    configService;
    logger = new Logger(AuthService_1.name);
    constructor(prisma, jwtService, configService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.configService = configService;
    }
    async adminLogin(dto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email.toLowerCase() },
        });
        if (!user ||
            !user.isActive ||
            !(await bcrypt.compare(dto.password, user.passwordHash))) {
            throw new UnauthorizedException('Invalid administrative email or password');
        }
        const tokens = this.generateTokens({
            sub: user.id,
            email: user.email,
            role: user.role,
            type: 'admin',
        });
        await this.prisma.user.update({
            where: { id: user.id },
            data: { refreshTokenHash: await bcrypt.hash(tokens.refreshToken, 10) },
        });
        return {
            ...tokens,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                permissions: user.permissions ?? [],
                mustChangePassword: user.mustChangePassword ?? false,
            },
        };
    }
    async customerLogin(dto) {
        const customer = await this.prisma.customer.findUnique({
            where: { email: dto.email.toLowerCase() },
        });
        if (!customer ||
            !customer.isActive ||
            !customer.passwordHash ||
            !(await bcrypt.compare(dto.password, customer.passwordHash))) {
            throw new UnauthorizedException('Invalid customer credentials');
        }
        return this.issueCustomerSession(customer.id, customer.email ?? undefined);
    }
    async registerCustomer(dto) {
        if (dto.password !== dto.confirmPassword) {
            throw new BadRequestException('Password confirmation does not match');
        }
        const phone = normalizeBangladeshPhone(dto.phone);
        const localPhone = `0${phone.slice(4)}`;
        const existing = await this.prisma.customer.findFirst({
            where: {
                OR: [
                    { phone: { in: [phone, localPhone] } },
                    { email: dto.email.toLowerCase() },
                ],
            },
            select: { id: true },
        });
        if (existing) {
            throw new ConflictException('A customer with this phone number or email is already registered');
        }
        let customer;
        try {
            customer = await this.prisma.customer.create({
                data: {
                    phone,
                    firstName: dto.firstName.trim(),
                    lastName: dto.lastName?.trim(),
                    email: dto.email.toLowerCase(),
                    passwordHash: await bcrypt.hash(dto.password, 12),
                    preferredSize: dto.preferredSize,
                    preferredFit: dto.preferredFit,
                    marketingConsent: dto.marketingConsent ?? false,
                },
                select: { id: true, email: true },
            });
        }
        catch (error) {
            if (isUniqueConstraintError(error)) {
                throw new ConflictException('A customer with this phone number or email is already registered');
            }
            throw error;
        }
        return this.issueCustomerSession(customer.id, customer.email ?? undefined);
    }
    async refreshTokens(refreshToken) {
        let payload;
        try {
            payload = this.jwtService.verify(refreshToken, {
                secret: this.refreshSecret(),
            });
        }
        catch {
            throw new UnauthorizedException('Refresh token is invalid or expired');
        }
        if (payload.type === 'customer') {
            const customer = await this.prisma.customer.findUnique({
                where: { id: payload.sub },
                select: { id: true, email: true, isActive: true, refreshTokenHash: true },
            });
            if (!customer?.isActive ||
                !customer.refreshTokenHash ||
                !(await bcrypt.compare(refreshToken, customer.refreshTokenHash))) {
                throw new UnauthorizedException('Refresh token is invalid or has been revoked');
            }
            return this.issueCustomerSession(customer.id, customer.email ?? undefined);
        }
        if (payload.type === 'admin') {
            const user = await this.prisma.user.findUnique({
                where: { id: payload.sub },
                select: { id: true, email: true, role: true, isActive: true, refreshTokenHash: true },
            });
            if (!user?.isActive ||
                !user.refreshTokenHash ||
                !(await bcrypt.compare(refreshToken, user.refreshTokenHash))) {
                throw new UnauthorizedException('Refresh token is invalid or has been revoked');
            }
            const tokens = this.generateTokens({
                sub: user.id,
                email: user.email,
                role: user.role,
                type: 'admin',
            });
            await this.prisma.user.update({
                where: { id: user.id },
                data: { refreshTokenHash: await bcrypt.hash(tokens.refreshToken, 10) },
            });
            return tokens;
        }
        throw new UnauthorizedException('Refresh token is invalid');
    }
    async logoutCustomer(customerId) {
        await this.prisma.customer.update({
            where: { id: customerId },
            data: { refreshTokenHash: null },
        });
        return { loggedOut: true };
    }
    async changeCustomerPassword(customerId, dto) {
        const customer = await this.prisma.customer.findUnique({
            where: { id: customerId },
            select: { passwordHash: true },
        });
        if (!customer?.passwordHash || !(await bcrypt.compare(dto.currentPassword, customer.passwordHash))) {
            throw new UnauthorizedException('Current password is incorrect');
        }
        await this.prisma.customer.update({
            where: { id: customerId },
            data: {
                passwordHash: await bcrypt.hash(dto.newPassword, 12),
                refreshTokenHash: null,
                resetTokenHash: null,
                resetTokenExpiresAt: null,
            },
        });
        return { passwordChanged: true };
    }
    async requestPasswordReset(email) {
        const host = this.configService.get('SMTP_HOST');
        const user = this.configService.get('SMTP_USER');
        const password = this.configService.get('SMTP_PASS');
        const from = this.configService.get('SMTP_FROM');
        const webUrl = this.configService.get('app.webFrontendUrl');
        if (!host || !user || !password || !from || !webUrl) {
            throw new ServiceUnavailableException('Password reset email service is not configured');
        }
        const customer = await this.prisma.customer.findUnique({
            where: { email: email.toLowerCase() },
            select: { id: true, email: true, isActive: true },
        });
        if (!customer?.isActive || !customer.email) {
            return { message: 'If an account exists for that address, a reset link will be sent.' };
        }
        const resetToken = randomBytes(32).toString('base64url');
        const resetTokenHash = hashToken(resetToken);
        const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
        await this.prisma.customer.update({
            where: { id: customer.id },
            data: { resetTokenHash, resetTokenExpiresAt: expiresAt },
        });
        const transport = nodemailer.createTransport({
            host,
            port: Number(this.configService.get('SMTP_PORT') || 587),
            secure: this.configService.get('SMTP_SECURE') === 'true',
            auth: { user, pass: password },
        });
        try {
            await transport.sendMail({
                from,
                to: customer.email,
                subject: 'Reset your Rongin Libas password',
                text: `Reset your password: ${webUrl.replace(/\/$/, '')}/reset-password?token=${encodeURIComponent(resetToken)}`,
            });
        }
        catch {
            await this.prisma.customer.update({
                where: { id: customer.id },
                data: { resetTokenHash: null, resetTokenExpiresAt: null },
            });
            this.logger.error('Password reset email delivery failed');
            throw new ServiceUnavailableException('Password reset email could not be sent');
        }
        finally {
            transport.close();
        }
        return { message: 'If an account exists for that address, a reset link will be sent.' };
    }
    async resetCustomerPassword(dto) {
        const customer = await this.prisma.customer.findFirst({
            where: {
                resetTokenHash: hashToken(dto.token),
                resetTokenExpiresAt: { gt: new Date() },
                isActive: true,
            },
            select: { id: true },
        });
        if (!customer)
            throw new UnauthorizedException('Password reset token is invalid or expired');
        await this.prisma.customer.update({
            where: { id: customer.id },
            data: {
                passwordHash: await bcrypt.hash(dto.newPassword, 12),
                resetTokenHash: null,
                resetTokenExpiresAt: null,
                refreshTokenHash: null,
            },
        });
        return { passwordReset: true };
    }
    async issueCustomerSession(customerId, email) {
        const tokens = this.generateTokens({
            sub: customerId,
            email,
            role: UserRole.CUSTOMER,
            type: 'customer',
        });
        await this.prisma.customer.update({
            where: { id: customerId },
            data: { refreshTokenHash: await bcrypt.hash(tokens.refreshToken, 10) },
        });
        return tokens;
    }
    generateTokens(payload) {
        const accessExpiresIn = this.configService.get('app.jwt.accessExpiresIn') || '15m';
        const refreshExpiresIn = this.configService.get('app.jwt.refreshExpiresIn') || '7d';
        const accessToken = this.jwtService.sign(payload, {
            secret: this.configService.get('app.jwt.accessSecret') ||
                'rongin_libas_dev_access_secret_key_change_in_production_2026',
            expiresIn: accessExpiresIn,
        });
        const refreshToken = this.jwtService.sign(payload, {
            secret: this.refreshSecret(),
            expiresIn: refreshExpiresIn,
        });
        return {
            accessToken,
            refreshToken,
            tokenType: 'Bearer',
            expiresIn: accessExpiresIn,
            user: {
                id: payload.sub,
                email: payload.email,
                role: payload.role,
                type: payload.type,
            },
        };
    }
    refreshSecret() {
        return (this.configService.get('app.jwt.refreshSecret') ||
            'rongin_libas_dev_refresh_secret_key_change_in_production_2026');
    }
};
AuthService = AuthService_1 = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService,
        JwtService,
        ConfigService])
], AuthService);
export { AuthService };
function normalizeBangladeshPhone(phone) {
    if (!phone)
        return phone;
    let digits = phone.replace(/[\s()\-]/g, '');
    if (digits.startsWith('+')) {
        digits = digits.slice(1);
    }
    if (digits.startsWith('880')) {
        digits = digits.slice(3);
    }
    if (digits.startsWith('0')) {
        digits = digits.slice(1);
    }
    return `+880${digits}`;
}
function hashToken(token) {
    return createHash('sha256').update(token).digest('hex');
}
function isUniqueConstraintError(error) {
    return (typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'P2002');
}
//# sourceMappingURL=auth.service.js.map