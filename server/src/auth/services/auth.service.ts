import {
  ConflictException,
  BadRequestException,
  Injectable,
  Logger,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomBytes } from 'node:crypto';
import bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service.js';
import { ChangePasswordDto, ResetPasswordDto } from '../dto/password-reset.dto.js';
import { LoginDto } from '../dto/login.dto.js';
import { RegisterCustomerDto } from '../dto/register.dto.js';
import { AuthProvider } from '@prisma/client';
import { UserRole } from '../../common/constants/roles.constant.js';
import { MailService } from '../../mail/mail.service.js';
import { FirebaseAdminService } from './firebase-admin.service.js';
import { SocialLoginDto } from '../dto/social-login.dto.js';

interface AuthPayload {
  sub: string;
  email?: string;
  role: string;
  type: 'admin' | 'customer';
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
    private readonly firebaseAdminService: FirebaseAdminService,
  ) {}

  async adminLogin(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (
      !user ||
      !user.isActive ||
      !(await bcrypt.compare(dto.password, user.passwordHash))
    ) {
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

  async customerLogin(dto: LoginDto) {
    const rawIdentifier = (dto.email || '').trim();
    if (!rawIdentifier) {
      throw new UnauthorizedException('Invalid customer credentials');
    }

    const isEmail = rawIdentifier.includes('@');
    let customer;

    if (isEmail) {
      customer = await this.prisma.customer.findFirst({
        where: { email: rawIdentifier.toLowerCase() },
      });
    } else {
      const normalizedPhone = normalizeBangladeshPhone(rawIdentifier);
      const localPhone = normalizedPhone.startsWith('+880')
        ? `0${normalizedPhone.slice(4)}`
        : normalizedPhone;
      const stripped = rawIdentifier.replace(/[\s()\-]/g, '');
      const phoneCandidates = Array.from(
        new Set([normalizedPhone, localPhone, rawIdentifier, stripped]),
      ).filter(Boolean);

      customer = await this.prisma.customer.findFirst({
        where: {
          OR: [
            { phone: { in: phoneCandidates } },
            { secondaryPhone: { in: phoneCandidates } },
            { email: rawIdentifier.toLowerCase() },
          ],
        },
      });
    }

    if (customer && !customer.isActive) {
      if (customer.banReason) {
        throw new UnauthorizedException(
          `Your account has been suspended by the shop administration. Reason: ${customer.banReason}`,
        );
      }
      throw new UnauthorizedException('Your account is currently inactive. Please contact support.');
    }

    if (
      !customer ||
      !customer.passwordHash ||
      !(await bcrypt.compare(dto.password, customer.passwordHash))
    ) {
      throw new UnauthorizedException('Invalid customer credentials');
    }
    return this.issueCustomerSession(customer.id, customer.email ?? undefined);
  }

  /**
   * Authenticate or register a customer using a verified Firebase ID token
   * Resolution order:
   * 1. Find AuthIdentity by provider + providerUserId
   * 2. If not found: check verified provider email against existing Customer email
   * 3. Link if safe verified email match
   * 4. Else create new Customer + AuthIdentity
   */
  async socialLogin(dto: SocialLoginDto) {
    const profile = await this.firebaseAdminService.verifyIdToken(dto.idToken);

    // Override names if provider provided full name on initial auth
    if (dto.fullName && dto.fullName.trim()) {
      const parts = dto.fullName.trim().split(/\s+/);
      profile.firstName = parts[0] || profile.firstName;
      profile.lastName = parts.slice(1).join(' ') || profile.lastName;
    }

    // 1. Check existing AuthIdentity
    const existingIdentity = await this.prisma.authIdentity.findUnique({
      where: {
        provider_providerUserId: {
          provider: profile.provider,
          providerUserId: profile.providerUserId,
        },
      },
      include: {
        customer: true,
      },
    });

    if (existingIdentity) {
      const customer = existingIdentity.customer;
      if (!customer || !customer.isActive) {
        if (customer?.banReason) {
          throw new UnauthorizedException(
            `Your account has been suspended by the shop administration. Reason: ${customer.banReason}`,
          );
        }
        throw new UnauthorizedException('Your account is currently inactive. Please contact support.');
      }

      // Update photo if newly available
      if (profile.photoUrl && !customer.photoUrl) {
        await this.prisma.customer.update({
          where: { id: customer.id },
          data: { photoUrl: profile.photoUrl },
        });
      }

      const session = await this.issueCustomerSession(customer.id, customer.email ?? undefined);
      return {
        ...session,
        isNewCustomer: false,
        isProfileComplete: Boolean(customer.phone),
      };
    }

    // 2. Check by verified email
    if (profile.email && profile.emailVerified) {
      const existingCustomer = await this.prisma.customer.findUnique({
        where: { email: profile.email },
      });

      if (existingCustomer) {
        if (!existingCustomer.isActive) {
          if (existingCustomer.banReason) {
            throw new UnauthorizedException(
              `Your account has been suspended by the shop administration. Reason: ${existingCustomer.banReason}`,
            );
          }
          throw new UnauthorizedException('Your account is currently inactive. Please contact support.');
        }

        // Link new identity to this existing customer
        await this.prisma.authIdentity.create({
          data: {
            customerId: existingCustomer.id,
            provider: profile.provider,
            providerUserId: profile.providerUserId,
            providerEmail: profile.email,
          },
        });

        if (profile.photoUrl && !existingCustomer.photoUrl) {
          await this.prisma.customer.update({
            where: { id: existingCustomer.id },
            data: { photoUrl: profile.photoUrl },
          });
        }

        const session = await this.issueCustomerSession(existingCustomer.id, existingCustomer.email ?? undefined);
        return {
          ...session,
          isNewCustomer: false,
          isProfileComplete: Boolean(existingCustomer.phone),
        };
      }
    }

    // 3. New Customer registration via social provider
    const newCustomer = await this.prisma.customer.create({
      data: {
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email ? profile.email.toLowerCase() : null,
        photoUrl: profile.photoUrl,
        phone: null,
        isActive: true,
        identities: {
          create: {
            provider: profile.provider,
            providerUserId: profile.providerUserId,
            providerEmail: profile.email,
          },
        },
      },
    });

    if (newCustomer.email) {
      this.mailService
        .sendWelcomeEmail(newCustomer.email, newCustomer.firstName)
        .catch((err: any) => {
          this.logger.warn(`Failed to dispatch social welcome email: ${err.message}`);
        });
    }

    const session = await this.issueCustomerSession(newCustomer.id, newCustomer.email ?? undefined);
    return {
      ...session,
      isNewCustomer: true,
      isProfileComplete: false,
    };
  }

  async linkSocialAccount(customerId: string, dto: SocialLoginDto) {
    const profile = await this.firebaseAdminService.verifyIdToken(dto.idToken);

    const existingIdentity = await this.prisma.authIdentity.findUnique({
      where: {
        provider_providerUserId: {
          provider: profile.provider,
          providerUserId: profile.providerUserId,
        },
      },
    });

    if (existingIdentity) {
      if (existingIdentity.customerId === customerId) {
        return {
          linked: true,
          provider: profile.provider,
          message: `${profile.provider} is already linked to your patron profile.`,
        };
      }
      throw new ConflictException(
        `This ${profile.provider} account is already connected to another patron account.`,
      );
    }

    await this.prisma.authIdentity.create({
      data: {
        customerId,
        provider: profile.provider,
        providerUserId: profile.providerUserId,
        providerEmail: profile.email,
      },
    });

    if (profile.photoUrl) {
      const current = await this.prisma.customer.findUnique({
        where: { id: customerId },
        select: { photoUrl: true },
      });
      if (!current?.photoUrl) {
        await this.prisma.customer.update({
          where: { id: customerId },
          data: { photoUrl: profile.photoUrl },
        });
      }
    }

    return {
      linked: true,
      provider: profile.provider,
      message: `${profile.provider} successfully linked to your account.`,
    };
  }

  async unlinkSocialAccount(customerId: string, provider: AuthProvider) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
      include: { identities: true },
    });

    if (!customer) {
      throw new UnauthorizedException('Customer not found');
    }

    const hasPassword = Boolean(customer.passwordHash);
    const hasOtherIdentities = customer.identities.filter((i) => i.provider !== provider).length > 0;

    if (!hasPassword && !hasOtherIdentities) {
      throw new BadRequestException(
        'You cannot disconnect this social provider. Please set a password or connect another login method first so you do not lose access to your account.',
      );
    }

    await this.prisma.authIdentity.deleteMany({
      where: { customerId, provider },
    });

    return {
      unlinked: true,
      provider,
      message: `${provider} has been disconnected.`,
    };
  }

  async getCustomerIdentities(customerId: string) {
    return this.prisma.authIdentity.findMany({
      where: { customerId },
      select: {
        id: true,
        provider: true,
        providerEmail: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async registerCustomer(dto: RegisterCustomerDto) {
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
        select: { id: true, email: true, firstName: true },
      });
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new ConflictException('A customer with this phone number or email is already registered');
      }
      throw error;
    }

    if (customer.email) {
      this.mailService.sendWelcomeEmail(customer.email, customer.firstName).catch((err: any) => {
        this.logger.warn(`Failed to dispatch welcome email to ${customer.email}: ${err.message}`);
      });
    }

    return this.issueCustomerSession(customer.id, customer.email ?? undefined);
  }

  async refreshTokens(refreshToken: string) {
    let payload: AuthPayload;
    try {
      payload = this.jwtService.verify<AuthPayload>(refreshToken, {
        secret: this.refreshSecret(),
      });
    } catch {
      throw new UnauthorizedException('Refresh token is invalid or expired');
    }

    if (payload.type === 'customer') {
      const customer = await this.prisma.customer.findUnique({
        where: { id: payload.sub },
        select: { id: true, email: true, isActive: true, refreshTokenHash: true },
      });
      if (
        !customer?.isActive ||
        !customer.refreshTokenHash ||
        !(await bcrypt.compare(refreshToken, customer.refreshTokenHash))
      ) {
        throw new UnauthorizedException('Refresh token is invalid or has been revoked');
      }
      return this.issueCustomerSession(customer.id, customer.email ?? undefined);
    }
    if (payload.type === 'admin') {
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, email: true, role: true, isActive: true, refreshTokenHash: true },
      });
      if (
        !user?.isActive ||
        !user.refreshTokenHash ||
        !(await bcrypt.compare(refreshToken, user.refreshTokenHash))
      ) {
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

  async logoutCustomer(customerId: string) {
    await this.prisma.customer.update({
      where: { id: customerId },
      data: { refreshTokenHash: null },
    });
    return { loggedOut: true };
  }

  async changeCustomerPassword(customerId: string, dto: ChangePasswordDto) {
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

  async requestPasswordReset(email: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true, email: true, firstName: true, isActive: true },
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

    try {
      await this.mailService.sendPasswordResetEmail(
        customer.email,
        resetToken,
        customer.firstName || undefined,
      );
    } catch (err) {
      await this.prisma.customer.update({
        where: { id: customer.id },
        data: { resetTokenHash: null, resetTokenExpiresAt: null },
      });
      this.logger.error(`Password reset email delivery failed: ${(err as Error).message}`);
      throw new ServiceUnavailableException('Password reset email could not be sent');
    }
    return { message: 'If an account exists for that address, a reset link will be sent.' };
  }

  async resetCustomerPassword(dto: ResetPasswordDto) {
    const customer = await this.prisma.customer.findFirst({
      where: {
        resetTokenHash: hashToken(dto.token),
        resetTokenExpiresAt: { gt: new Date() },
        isActive: true,
      },
      select: { id: true, email: true, firstName: true },
    });
    if (!customer) throw new UnauthorizedException('Password reset token is invalid or expired');
    await this.prisma.customer.update({
      where: { id: customer.id },
      data: {
        passwordHash: await bcrypt.hash(dto.newPassword, 12),
        resetTokenHash: null,
        resetTokenExpiresAt: null,
        refreshTokenHash: null,
      },
    });

    if (customer.email) {
      this.mailService
        .sendPasswordResetSuccessEmail(customer.email, customer.firstName || undefined)
        .catch((err: any) => {
          this.logger.warn(`Failed to dispatch password reset success notification: ${err.message}`);
        });
    }

    return { passwordReset: true };
  }

  private async issueCustomerSession(customerId: string, email?: string) {
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

  private generateTokens(payload: AuthPayload) {
    const accessExpiresIn = this.configService.get<string>('app.jwt.accessExpiresIn') || '15m';
    const refreshExpiresIn = this.configService.get<string>('app.jwt.refreshExpiresIn') || '7d';
    const accessToken = this.jwtService.sign(payload, {
      secret:
        this.configService.get<string>('app.jwt.accessSecret') ||
        'rongin_libas_dev_access_secret_key_change_in_production_2026',
      expiresIn: accessExpiresIn as never,
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.refreshSecret(),
      expiresIn: refreshExpiresIn as never,
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

  private refreshSecret() {
    return (
      this.configService.get<string>('app.jwt.refreshSecret') ||
      'rongin_libas_dev_refresh_secret_key_change_in_production_2026'
    );
  }
}

function normalizeBangladeshPhone(phone: string): string {
  if (!phone) return phone;
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

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 'P2002'
  );
}
