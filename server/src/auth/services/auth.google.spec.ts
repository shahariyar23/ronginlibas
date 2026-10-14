import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MailService } from '../../mail/mail.service.js';
import { FirebaseAdminService } from './firebase-admin.service.js';
import { AuthProvider } from '@prisma/client';

const verifyIdTokenMock = vi.fn();

vi.mock('google-auth-library', () => {
  class MockOAuth2Client {
    verifyIdToken = verifyIdTokenMock;
  }
  return {
    OAuth2Client: MockOAuth2Client,
  };
});

describe('AuthService - Google Identity Services (GIS)', () => {
  let authService: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let configService: ConfigService;
  let mailService: MailService;
  let firebaseAdminService: FirebaseAdminService;

  const mockGoogleClientId = '529105196916-test.apps.googleusercontent.com';

  beforeEach(() => {
    vi.clearAllMocks();

    prisma = {
      customer: {
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      authIdentity: {
        findUnique: vi.fn(),
        create: vi.fn(),
      },
    } as unknown as PrismaService;

    jwtService = {
      sign: vi.fn().mockReturnValue('mock.jwt.token'),
    } as unknown as JwtService;

    configService = {
      get: vi.fn((key: string) => {
        if (key === 'GOOGLE_CLIENT_ID') return mockGoogleClientId;
        if (key === 'app.jwt.accessExpiresIn') return '15m';
        if (key === 'app.jwt.refreshExpiresIn') return '7d';
        return undefined;
      }),
    } as unknown as ConfigService;

    mailService = {
      sendWelcomeEmail: vi.fn().mockResolvedValue(true),
    } as unknown as MailService;

    firebaseAdminService = {} as unknown as FirebaseAdminService;

    authService = new AuthService(
      prisma,
      jwtService,
      configService,
      mailService,
      firebaseAdminService,
    );
  });

  it('rejects an empty or invalid Google credential token', async () => {
    await expect(authService.loginWithGoogle('')).rejects.toThrow(
      'Google credential token is required',
    );
  });

  it('rejects when Google ID token verification fails', async () => {
    verifyIdTokenMock.mockRejectedValueOnce(
      new Error('Token used too early, 1728900000 < 1728900100'),
    );

    await expect(
      authService.loginWithGoogle('invalid.or.expired.jwt.credential'),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('authenticates an existing customer when AuthIdentity matches Google sub', async () => {
    verifyIdTokenMock.mockResolvedValueOnce({
      getPayload: () => ({
        sub: 'google-sub-12345',
        email: 'patron@ronginlibas.com',
        email_verified: true,
        name: 'Mahfuzur Rahman',
        picture: 'https://lh3.googleusercontent.com/photo.jpg',
      }),
    });

    const mockCustomer = {
      id: 'cust-101',
      firstName: 'Mahfuzur',
      lastName: 'Rahman',
      email: 'patron@ronginlibas.com',
      phone: '+8801700000000',
      isActive: true,
      photoUrl: null,
    };

    vi.mocked(prisma.authIdentity.findUnique).mockResolvedValueOnce({
      id: 'ident-1',
      customerId: 'cust-101',
      provider: AuthProvider.GOOGLE,
      providerUserId: 'google-sub-12345',
      customer: mockCustomer,
    } as any);

    vi.mocked(prisma.customer.update).mockResolvedValueOnce({} as any);

    const result = await authService.loginWithGoogle('valid.google.id.token');

    expect(result.accessToken).toBe('mock.jwt.token');
    expect(result.isNewCustomer).toBe(false);
    expect(result.isProfileComplete).toBe(true);
    expect(prisma.customer.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'cust-101' },
        data: expect.objectContaining({ photoUrl: 'https://lh3.googleusercontent.com/photo.jpg' }),
      }),
    );
  });

  it('safely links Google identity to existing customer when verified email matches', async () => {
    verifyIdTokenMock.mockResolvedValueOnce({
      getPayload: () => ({
        sub: 'google-sub-new-999',
        email: 'existing@ronginlibas.com',
        email_verified: true,
        name: 'Shovon Ahmed',
        picture: null,
      }),
    });

    // No existing identity
    vi.mocked(prisma.authIdentity.findUnique).mockResolvedValueOnce(null);

    // Existing customer found by verified email
    const existingCustomer = {
      id: 'cust-202',
      firstName: 'Shovon',
      lastName: 'Ahmed',
      email: 'existing@ronginlibas.com',
      phone: '+8801800000000',
      isActive: true,
      photoUrl: null,
    };
    vi.mocked(prisma.customer.findUnique).mockResolvedValueOnce(existingCustomer as any);
    vi.mocked(prisma.authIdentity.create).mockResolvedValueOnce({} as any);

    const result = await authService.loginWithGoogle('valid.google.id.token');

    expect(result.accessToken).toBe('mock.jwt.token');
    expect(result.isNewCustomer).toBe(false);
    expect(prisma.authIdentity.create).toHaveBeenCalledWith({
      data: {
        customerId: 'cust-202',
        provider: AuthProvider.GOOGLE,
        providerUserId: 'google-sub-new-999',
        providerEmail: 'existing@ronginlibas.com',
      },
    });
  });

  it('creates a new Customer and AuthIdentity when neither exists', async () => {
    verifyIdTokenMock.mockResolvedValueOnce({
      getPayload: () => ({
        sub: 'google-sub-brand-new',
        email: 'newpatron@gmail.com',
        email_verified: true,
        name: 'Rafiul Islam',
        given_name: 'Rafiul',
        family_name: 'Islam',
        picture: 'https://lh3.googleusercontent.com/p2.jpg',
      }),
    });

    vi.mocked(prisma.authIdentity.findUnique).mockResolvedValueOnce(null);
    vi.mocked(prisma.customer.findUnique).mockResolvedValueOnce(null);

    const createdCustomer = {
      id: 'cust-new-303',
      firstName: 'Rafiul',
      lastName: 'Islam',
      email: 'newpatron@gmail.com',
      phone: null,
      photoUrl: 'https://lh3.googleusercontent.com/p2.jpg',
      isActive: true,
    };
    vi.mocked(prisma.customer.create).mockResolvedValueOnce(createdCustomer as any);

    const result = await authService.loginWithGoogle('valid.google.id.token');

    expect(result.isNewCustomer).toBe(true);
    expect(result.isProfileComplete).toBe(false);
    expect(prisma.customer.create).toHaveBeenCalledWith({
      data: {
        firstName: 'Rafiul',
        lastName: 'Islam',
        email: 'newpatron@gmail.com',
        photoUrl: 'https://lh3.googleusercontent.com/p2.jpg',
        phone: null,
        isActive: true,
        identities: {
          create: {
            provider: AuthProvider.GOOGLE,
            providerUserId: 'google-sub-brand-new',
            providerEmail: 'newpatron@gmail.com',
          },
        },
      },
    });
    expect(mailService.sendWelcomeEmail).toHaveBeenCalledWith('newpatron@gmail.com', 'Rafiul');
  });

  it('rejects suspended/banned customer account from logging in via Google', async () => {
    verifyIdTokenMock.mockResolvedValueOnce({
      getPayload: () => ({
        sub: 'google-sub-banned',
        email: 'banned@ronginlibas.com',
        email_verified: true,
      }),
    });

    vi.mocked(prisma.authIdentity.findUnique).mockResolvedValueOnce({
      id: 'ident-banned',
      customerId: 'cust-banned',
      provider: AuthProvider.GOOGLE,
      providerUserId: 'google-sub-banned',
      customer: {
        id: 'cust-banned',
        isActive: false,
        banReason: 'Fraudulent order activity detected',
      },
    } as any);

    await expect(authService.loginWithGoogle('valid.google.id.token')).rejects.toThrow(
      'Your account has been suspended by the shop administration. Reason: Fraudulent order activity detected',
    );
  });

  it('links Google identity when linkGoogleAccount is called', async () => {
    verifyIdTokenMock.mockResolvedValueOnce({
      getPayload: () => ({
        sub: 'google-sub-link-me',
        email: 'linkme@gmail.com',
        email_verified: true,
        picture: 'https://photo.jpg',
      }),
    });

    vi.mocked(prisma.authIdentity.findUnique).mockResolvedValueOnce(null);
    vi.mocked(prisma.authIdentity.create).mockResolvedValueOnce({
      id: 'ident-linked',
      provider: AuthProvider.GOOGLE,
      providerEmail: 'linkme@gmail.com',
      createdAt: new Date(),
    } as any);
    vi.mocked(prisma.customer.findUnique).mockResolvedValueOnce({ photoUrl: null } as any);
    vi.mocked(prisma.customer.update).mockResolvedValueOnce({} as any);

    const result = await authService.linkGoogleAccount('cust-current', 'valid.token');
    expect(result.id).toBe('ident-linked');
    expect(prisma.authIdentity.create).toHaveBeenCalledWith({
      data: {
        customerId: 'cust-current',
        provider: AuthProvider.GOOGLE,
        providerUserId: 'google-sub-link-me',
        providerEmail: 'linkme@gmail.com',
      },
      select: {
        id: true,
        provider: true,
        providerEmail: true,
        createdAt: true,
      },
    });
  });

  it('prevents linking if the Google identity is already connected to another customer', async () => {
    verifyIdTokenMock.mockResolvedValueOnce({
      getPayload: () => ({
        sub: 'google-sub-already-taken',
        email: 'other@gmail.com',
        email_verified: true,
      }),
    });

    vi.mocked(prisma.authIdentity.findUnique).mockResolvedValueOnce({
      id: 'ident-taken',
      customerId: 'cust-different-person',
      provider: AuthProvider.GOOGLE,
      providerUserId: 'google-sub-already-taken',
    } as any);

    await expect(
      authService.linkGoogleAccount('cust-current', 'valid.token'),
    ).rejects.toThrow(ConflictException);
  });
});
