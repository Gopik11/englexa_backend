import { Injectable, NotFoundException } from '@nestjs/common';
import { ProgressStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { BadgeId } from './entities/badge.entity';
import {
  BADGE_DEFINITIONS,
  resolveUnlockedBadges,
} from './utils/badge-rules';
import {
  computeLevel,
  xpForActivity,
  XpActivity,
  XP_PER_LEVEL,
} from './entities/xp.entity';
import {
  computeNextStreak,
  effectiveStreak,
} from './utils/streak-rules';
import {
  moduleForActivity,
  recordDailyActivity,
} from '../analytics/utils/daily-activity-recorder';

export interface GamificationProfile {
  xp: number;
  streak: number;
  xpToNextLevel: number;
  level: number;
  badges: Array<{ id: string; title: string; description: string }>;
}

export interface GamificationStatus {
  xp: number;
  level: number;
  streak: number;
  badges: string[];
  xpToNextLevel: number;
}

export interface AwardXpResult {
  xp: number;
  xpEarned: number;
  level: number;
  streak: number;
}

@Injectable()
export class GamificationService {
  constructor(private readonly prisma: PrismaService) {}

  async recordLogin(userId: string): Promise<number> {
    return this.recordActivity(userId);
  }

  async recordActivity(
    userId: string,
    options?: { module?: string },
  ): Promise<number> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const streak = computeNextStreak(user.streak, user.lastActiveAt, new Date());

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        streak,
        lastActiveAt: new Date(),
      },
    });

    await recordDailyActivity(this.prisma, userId, {
      module: options?.module,
    });

    return streak;
  }

  async updateStreak(userId: string): Promise<number> {
    return this.recordActivity(userId);
  }

  async resetStreak(userId: string): Promise<number> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        streak: 0,
        lastActiveAt: new Date(),
      },
    });

    return 0;
  }

  async addXp(userId: string, amount: number): Promise<number> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { xp: { increment: amount } },
    });
    return user.xp;
  }

  async awardActivityXp(
    userId: string,
    activity: XpActivity,
    options?: { incrementStat?: boolean },
  ): Promise<AwardXpResult> {
    const amount = xpForActivity(activity);
    const module = moduleForActivity(activity) ?? undefined;
    const streak = await this.recordActivity(userId, { module });

    if (options?.incrementStat !== false) {
      await this.incrementPracticeStat(userId, activity);
    }

    const xp = await this.addXp(userId, amount);
    const { level } = computeLevel(xp);

    return {
      xp,
      xpEarned: amount,
      level,
      streak: effectiveStreak(streak, new Date(), new Date()),
    };
  }

  async incrementPracticeStat(
    userId: string,
    activity: XpActivity,
  ): Promise<void> {
    const data = statFieldForActivity(activity);
    if (!data) {
      return;
    }

    await this.prisma.userPracticeStats.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data,
    });
  }

  async getStatus(userId: string): Promise<GamificationStatus> {
    const profile = await this.buildProfile(userId);
    return {
      xp: profile.xp,
      level: profile.level,
      streak: profile.streak,
      badges: profile.badges.map((badge) => badge.id),
      xpToNextLevel: profile.xpToNextLevel,
    };
  }

  async getProfile(userId: string): Promise<GamificationProfile> {
    return this.buildProfile(userId);
  }

  private async buildProfile(userId: string): Promise<GamificationProfile> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const [completedLessons, missionCount, practiceStats, grammarCorrectSum] =
      await Promise.all([
        this.prisma.progress.count({
          where: { userId, status: ProgressStatus.COMPLETED },
        }),
        this.prisma.missionCompletion.count({ where: { userId } }),
        this.prisma.userPracticeStats.findUnique({ where: { userId } }),
        this.prisma.grammarConceptProgress.aggregate({
          where: { userId },
          _sum: { correctCount: true },
        }),
      ]);

    const streak = effectiveStreak(user.streak, user.lastActiveAt);
    const { level, xpToNextLevel } = computeLevel(user.xp);

    const unlocked = resolveUnlockedBadges({
      grammarCorrect:
        practiceStats?.grammarCorrect ??
        grammarCorrectSum._sum.correctCount ??
        0,
      vocabularyCorrect: practiceStats?.vocabularyCorrect ?? 0,
      readingCompleted: practiceStats?.readingCompleted ?? 0,
      speakingSubmissions: practiceStats?.speakingSubmissions ?? 0,
      writingSubmissions: practiceStats?.writingSubmissions ?? 0,
      streak,
      xp: user.xp,
      completedLessons,
      missionCount,
    });

    return {
      xp: user.xp,
      streak,
      level,
      xpToNextLevel,
      badges: unlocked.map((id) => BADGE_DEFINITIONS[id]),
    };
  }
}

function statFieldForActivity(
  activity: XpActivity,
): Record<string, { increment: number }> | null {
  switch (activity) {
    case 'grammar_correct':
      return { grammarCorrect: { increment: 1 } };
    case 'vocabulary_correct':
      return { vocabularyCorrect: { increment: 1 } };
    case 'reading_completed':
      return { readingCompleted: { increment: 1 } };
    case 'speaking_submission':
      return { speakingSubmissions: { increment: 1 } };
    case 'writing_submission':
      return { writingSubmissions: { increment: 1 } };
    default:
      return null;
  }
}

export { BadgeId, XP_PER_LEVEL };
