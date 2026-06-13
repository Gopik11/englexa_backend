import { GamificationService } from './gamification.service';
import { BadgeId } from './entities/badge.entity';

describe('GamificationService', () => {
  const prisma = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    progress: {
      count: jest.fn(),
    },
    missionCompletion: {
      count: jest.fn(),
    },
    userPracticeStats: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
    grammarConceptProgress: {
      aggregate: jest.fn(),
    },
  };

  const service = new GamificationService(prisma as never);

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.userPracticeStats.findUnique.mockResolvedValue(null);
    prisma.grammarConceptProgress.aggregate.mockResolvedValue({
      _sum: { correctCount: 0 },
    });
  });

  it('updateStreak increments streak for consecutive days', async () => {
    const yesterday = new Date();
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);

    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      streak: 2,
      lastActiveAt: yesterday,
    });
    prisma.user.update.mockResolvedValue({
      id: 'user-1',
      streak: 3,
    });

    const streak = await service.updateStreak('user-1');

    expect(streak).toBe(3);
  });

  it('resetStreak sets streak to zero', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-2',
      streak: 5,
      lastActiveAt: new Date(),
    });
    prisma.user.update.mockResolvedValue({
      id: 'user-2',
      streak: 0,
    });

    const streak = await service.resetStreak('user-2');
    expect(streak).toBe(0);
  });

  it('unlocks streak and xp badges', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      xp: 520,
      streak: 7,
      lastActiveAt: new Date(),
    });
    prisma.progress.count.mockResolvedValue(2);
    prisma.missionCompletion.count.mockResolvedValue(5);

    const profile = await service.getProfile('user-1');
    const badgeIds = profile.badges.map((badge) => badge.id);

    expect(badgeIds).toContain(BadgeId.FIRST_LESSON);
    expect(badgeIds).toContain(BadgeId.STREAK_7);
    expect(badgeIds).toContain(BadgeId.XP_500);
    expect(profile.level).toBeGreaterThanOrEqual(2);
  });

  it('returns status with badge id strings', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      xp: 100,
      streak: 3,
      lastActiveAt: new Date(),
    });
    prisma.progress.count.mockResolvedValue(0);
    prisma.missionCompletion.count.mockResolvedValue(0);

    const status = await service.getStatus('user-1');
    expect(status).toMatchObject({
      xp: 100,
      level: expect.any(Number),
      streak: 3,
      badges: expect.any(Array),
    });
  });
});
