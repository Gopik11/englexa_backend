import { ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Level, PlanType } from '@prisma/client';
import { PlanService } from './plan.service';

describe('PlanService', () => {
  const prisma = { user: { findUnique: jest.fn() } };
  const configService = {
    get: jest.fn((key: string, fallback?: number) => fallback),
  };

  const service = new PlanService(
    prisma as never,
    configService as unknown as ConfigService,
  );

  it('treats active premium users as premium', () => {
    const premium = service.isPremium({
      planType: PlanType.PREMIUM,
      planExpiresAt: new Date(Date.now() + 86400000),
    });
    expect(premium).toBe(true);
  });

  it('blocks free users from A2 lessons', () => {
    expect(() =>
      service.assertLevelAccess(
        { planType: PlanType.FREE, planExpiresAt: null },
        Level.A2,
      ),
    ).toThrow(ForbiddenException);
  });

  it('allows premium users to access A2 lessons', () => {
    expect(
      service.canAccessLevel(
        { planType: PlanType.PREMIUM, planExpiresAt: null },
        Level.A2,
      ),
    ).toBe(true);
  });

  it('returns lower AI limits for free users', () => {
    delete process.env.AI_DEV_MODE;
    (configService.get as jest.Mock).mockImplementation(
      (key: string, fallback?: number) => {
        if (key === 'ai.devMode') return false;
        if (key === 'ai.freeTutorDailyLimit') return 5;
        if (key === 'ai.freePronunciationDailyLimit') return 3;
        if (key === 'ai.freeSpeakingDailyLimit') return 5;
        if (key === 'ai.freeWritingDailyLimit') return 5;
        return fallback;
      },
    );

    const limits = service.getAiLimits({
      planType: PlanType.FREE,
      planExpiresAt: null,
    });
    expect(limits.tutor).toBe(5);
    expect(limits.pronunciation).toBe(3);
  });
});
