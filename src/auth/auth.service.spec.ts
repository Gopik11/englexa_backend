import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { PlanType, UserRole } from '@prisma/client';
import { UsersService } from '../users/users.service';
import { GamificationService } from '../gamification/gamification.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: jest.Mocked<UsersService>;

  const mockUser = {
    id: 'user-1',
    email: 'learner@example.com',
    passwordHash: '$2b$12$hashed',
    role: UserRole.LEARNER,
    ageGroup: null,
    level: 'A1' as const,
    country: null,
    planType: PlanType.FREE,
    planExpiresAt: null,
    xp: 0,
    streak: 0,
    lastActiveAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockResolvedValue('token'),
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config: Record<string, string | number> = {
                'jwt.accessSecret': 'access-secret',
                'jwt.refreshSecret': 'refresh-secret',
                'jwt.accessExpiresInSeconds': 900,
                'jwt.refreshExpiresInSeconds': 604800,
              };
              return config[key];
            }),
          },
        },
        {
          provide: GamificationService,
          useValue: {
            recordLogin: jest.fn().mockResolvedValue(1),
          },
        },
      ],
    }).compile();

    authService = module.get(AuthService);
    usersService = module.get(UsersService);
  });

  it('throws when registering an existing email', async () => {
    usersService.findByEmail.mockResolvedValue(mockUser);

    await expect(
      authService.register({
        email: mockUser.email,
        password: 'password123',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('throws on invalid login credentials', async () => {
    usersService.findByEmail.mockResolvedValue(null);

    await expect(
      authService.login({
        email: 'missing@example.com',
        password: 'password123',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
