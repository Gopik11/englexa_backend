import { HttpException } from '@nestjs/common';
import { AiUsageType, PlanType } from '@prisma/client';
import { PREMIUM_REQUIRED_CODE } from '../common/constants/premium';
import { AiUsageService } from './ai-usage.service';

describe('AiUsageService', () => {
  const prisma = {
    aIUsage: {
      findFirst: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
  };

  const planService = {
    getUserPlan: jest.fn().mockResolvedValue({
      planType: PlanType.FREE,
      planExpiresAt: null,
    }),
    isPremium: jest.fn().mockReturnValue(false),
    getLimitForType: jest.fn().mockReturnValue(2),
  };

  const service = new AiUsageService(prisma as never, planService as never);

  beforeEach(() => {
    jest.clearAllMocks();
    planService.isPremium.mockReturnValue(false);
    planService.getLimitForType.mockReturnValue(2);
  });

  it('allows usage under the daily limit', async () => {
    prisma.aIUsage.findFirst.mockResolvedValue({ id: 'u1', count: 1 });

    const result = await service.checkAndIncrement('user-1', AiUsageType.TUTOR);

    expect(result.used).toBe(2);
    expect(result.limit).toBe(2);
    expect(prisma.aIUsage.update).toHaveBeenCalled();
  });

  it('suggests premium when free quota is exhausted', async () => {
    prisma.aIUsage.findFirst.mockResolvedValue({ id: 'u1', count: 2 });

    await expect(
      service.checkAndIncrement('user-1', AiUsageType.TUTOR),
    ).rejects.toMatchObject({
      response: expect.objectContaining({
        error: PREMIUM_REQUIRED_CODE,
      }),
    });
  });

  it('blocks premium users with rate limit code when quota is exhausted', async () => {
    planService.isPremium.mockReturnValue(true);
    prisma.aIUsage.findFirst.mockResolvedValue({ id: 'u1', count: 2 });

    try {
      await service.checkAndIncrement('user-1', AiUsageType.TUTOR);
      fail('Expected HttpException');
    } catch (error) {
      const response = (error as HttpException).getResponse() as Record<
        string,
        unknown
      >;
      expect(response.error).toBe('RATE_LIMIT_EXCEEDED');
    }
  });
});
