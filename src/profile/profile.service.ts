import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CacheKeys, CacheTtl } from '../common/cache/cache-keys';
import { CachedDataService } from '../common/cache/cached-data.service';
import { ProgressStatus } from '@prisma/client';
import { dailyActivityClient } from '../analytics/utils/prisma-daily-activity';
import { MasteryService } from '../mastery/mastery.service';
import { PrismaService } from '../prisma/prisma.service';
import { UserAchievement } from './entities/achievement.entity';
import { UserBadge } from './entities/badge.entity';
import {
  LearnerProfile,
  ProfileStatsUpdate,
  UpdateXpResult,
} from './entities/profile.entity';
import {
  achievementProgress,
  ACHIEVEMENT_DEFINITIONS,
} from './utils/achievement-awarder';
import { resolveEarnedBadges, PROFILE_BADGE_DEFINITIONS } from './utils/badge-awarder';
import {
  userAchievementClient,
  userBadgeClient,
} from './utils/prisma-profile';
import {
  effectiveStreak,
  streakAfterActivity,
} from './utils/streak-manager';
import {
  calculateXpAward,
  computeLevel,
  perfectAccuracyBonus,
  ProfileXpSource,
} from './utils/xp-calculator';

@Injectable()
export class ProfileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly masteryService: MasteryService,
    private readonly cachedData: CachedDataService,
  ) {}

  async getProfile(userId: string): Promise<LearnerProfile> {
    return this.cachedData.getOrSet(
      CacheKeys.profile(userId),
      CacheTtl.fifteenMinutes,
      () => this.buildProfile(userId),
    );
  }

  private async buildProfile(userId: string): Promise<LearnerProfile> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        xp: true,
        streak: true,
        lastActiveAt: true,
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const [
      lessonsCompleted,
      overview,
      dailyRows,
      practiceStats,
      srsReviewCount,
      dailyChallengesCompleted,
    ] = await Promise.all([
      this.prisma.progress.count({
        where: { userId, status: ProgressStatus.COMPLETED },
      }),
      this.masteryService.getOverview(userId),
      dailyActivityClient(this.prisma).findMany({ where: { userId } }),
      this.prisma.userPracticeStats.findUnique({ where: { userId } }),
      this.countSrsReviews(userId),
      this.prisma.dailyChallenge.count({
        where: { userId, completed: true },
      }),
    ]);

    const streak = effectiveStreak(user.streak, user.lastActiveAt);
    const { level, xp_to_next_level } = computeLevel(user.xp);
    const conceptsMastered = this.countMasteredConcepts(overview);
    const favoriteModules = this.resolveFavoriteModules(dailyRows);
    const totalTimeSpent = dailyRows.reduce(
      (sum, row) => sum + row.minutesSpent,
      0,
    );

    await this.syncAwards(userId);

    return {
      userId: user.id,
      email: user.email,
      xp: user.xp,
      level,
      streak,
      last_active: user.lastActiveAt,
      total_time_spent: totalTimeSpent,
      lessons_completed: lessonsCompleted,
      concepts_mastered: conceptsMastered,
      weak_areas: overview.weakest
        .slice(0, 5)
        .map((item) => `${item.module}:${item.concept}`),
      strengths: overview.strongest
        .slice(0, 5)
        .map((item) => `${item.module}:${item.concept}`),
      favorite_modules: favoriteModules,
      xp_to_next_level,
    };
  }

  async updateXP(
    userId: string,
    amount: number,
    options?: { perfectAccuracy?: boolean; skipStreak?: boolean },
  ): Promise<UpdateXpResult> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const streak = options?.skipStreak
      ? effectiveStreak(user.streak, user.lastActiveAt)
      : await this.updateStreak(userId);
    const bonus = options?.perfectAccuracy ? perfectAccuracyBonus() : 0;
    const totalEarned = Math.max(0, amount) + bonus;

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { xp: { increment: totalEarned } },
    });

    const { level, xp_to_next_level } = computeLevel(updated.xp);
    const awards = await this.syncAwards(userId);

    await this.cachedData.invalidate(CacheKeys.profile(userId));

    return {
      xp: updated.xp,
      level,
      xp_earned: totalEarned,
      streak,
      xp_to_next_level,
      new_badges: awards.newBadges,
      new_achievements: awards.newAchievements,
    };
  }

  async awardXpForActivity(
    userId: string,
    source: ProfileXpSource,
    options?: { perfectAccuracy?: boolean; customAmount?: number },
  ): Promise<UpdateXpResult> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const streak = await this.updateStreak(userId);
    const amount = calculateXpAward({
      source,
      streak,
      perfectAccuracy: options?.perfectAccuracy,
      customAmount: options?.customAmount,
    });

    return this.updateXP(userId, amount, {
      perfectAccuracy: false,
      skipStreak: true,
    });
  }

  async updateStreak(userId: string): Promise<number> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const now = new Date();
    const streak = streakAfterActivity(
      user.streak,
      user.lastActiveAt,
      now,
    );

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        streak,
        lastActiveAt: now,
      },
    });

    return effectiveStreak(streak, now);
  }

  async awardBadges(userId: string): Promise<UserBadge[]> {
    await this.syncAwards(userId);
    return this.getBadges(userId);
  }

  async awardAchievements(userId: string): Promise<UserAchievement[]> {
    await this.syncAwards(userId);
    return this.getAchievements(userId);
  }

  async updateStats(
    userId: string,
    stats: ProfileStatsUpdate,
  ): Promise<LearnerProfile> {
    if (stats.favorite_modules?.length) {
      await this.prisma.userPracticeStats.upsert({
        where: { userId },
        create: { userId },
        update: {},
      });
    }

    return this.getProfile(userId);
  }

  async getBadges(userId: string): Promise<UserBadge[]> {
    const rows = await userBadgeClient(this.prisma).findMany({
      where: { userId },
      orderBy: { earnedAt: 'desc' },
    });

    return rows.map((row) => ({
      userId: row.userId,
      badgeId: row.badgeId,
      name: row.name,
      description: row.description,
      earnedAt: row.earnedAt,
    }));
  }

  async getAchievements(userId: string): Promise<UserAchievement[]> {
    await this.syncAwards(userId);

    const rows = await userAchievementClient(this.prisma).findMany({
      where: { userId },
      orderBy: { achievementId: 'asc' },
    });

    return rows.map((row) => ({
      userId: row.userId,
      achievementId: row.achievementId,
      name: row.name,
      description: row.description,
      earnedAt: row.earnedAt,
      progress: row.progress,
      goal: row.goal,
    }));
  }

  async assertUserAccess(
    requestedUserId: string,
    currentUserId: string,
  ): Promise<void> {
    if (requestedUserId !== currentUserId) {
      throw new ForbiddenException('Cannot access another user\'s profile');
    }
  }

  private async syncAwards(
    userId: string,
  ): Promise<{ newBadges: string[]; newAchievements: string[] }> {
    const ctx = await this.buildAwardContext(userId);
    const earnedBadgeIds = resolveEarnedBadges(ctx);
    const badgeClient = userBadgeClient(this.prisma);
    const achievementClient = userAchievementClient(this.prisma);

    const existingBadges = await badgeClient.findMany({ where: { userId } });
    const existingBadgeIds = new Set(existingBadges.map((row) => row.badgeId));
    const newBadges: string[] = [];

    for (const badgeId of earnedBadgeIds) {
      const def = PROFILE_BADGE_DEFINITIONS[badgeId];
      if (!def) continue;

      if (!existingBadgeIds.has(badgeId)) {
        newBadges.push(badgeId);
      }

      await badgeClient.upsert({
        where: { userId_badgeId: { userId, badgeId } },
        create: {
          userId,
          badgeId,
          name: def.name,
          description: def.description,
          earnedAt: new Date(),
        },
        update: {},
      });
    }

    const existingAchievements = await achievementClient.findMany({
      where: { userId },
    });
    const existingAchievementIds = new Set(
      existingAchievements.map((row) => row.achievementId),
    );
    const newAchievements: string[] = [];

    for (const [achievementId, def] of Object.entries(ACHIEVEMENT_DEFINITIONS)) {
      const progress = achievementProgress(achievementId, ctx);
      const earned = progress >= def.goal;
      const earnedAt =
        earned && !existingAchievementIds.has(achievementId)
          ? new Date()
          : existingAchievements.find(
              (row) => row.achievementId === achievementId,
            )?.earnedAt ?? (earned ? new Date() : null);

      if (earned && !existingAchievementIds.has(achievementId)) {
        newAchievements.push(achievementId);
      }

      await achievementClient.upsert({
        where: { userId_achievementId: { userId, achievementId } },
        create: {
          userId,
          achievementId,
          name: def.name,
          description: def.description,
          progress,
          goal: def.goal,
          earnedAt,
        },
        update: {
          progress,
          earnedAt: earned ? earnedAt ?? new Date() : null,
        },
      });
    }

    return { newBadges, newAchievements };
  }

  private async buildAwardContext(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const [
      lessonsCompleted,
      overview,
      practiceStats,
      srsReviewCount,
      dailyChallengesCompleted,
    ] = await Promise.all([
      this.prisma.progress.count({
        where: { userId, status: ProgressStatus.COMPLETED },
      }),
      this.masteryService.getOverview(userId),
      this.prisma.userPracticeStats.findUnique({ where: { userId } }),
      this.countSrsReviews(userId),
      this.prisma.dailyChallenge.count({
        where: { userId, completed: true },
      }),
    ]);

    const moduleMastery: Record<string, number> = {};
    for (const item of overview.concepts) {
      const current = moduleMastery[item.module] ?? 0;
      moduleMastery[item.module] = Math.max(current, item.masteryScore);
    }

    return {
      xp: user.xp,
      streak: effectiveStreak(user.streak, user.lastActiveAt),
      lessonsCompleted,
      conceptsMastered: this.countMasteredConcepts(overview),
      srsReviewCount,
      moduleMastery,
      speakingSubmissions: practiceStats?.speakingSubmissions ?? 0,
      dailyChallengesCompleted,
    };
  }

  private countMasteredConcepts(overview: {
    concepts: Array<{ masteryScore: number }>;
  }): number {
    return overview.concepts.filter((item) => item.masteryScore >= 80).length;
  }

  private async countSrsReviews(userId: string): Promise<number> {
    const rows = await this.prisma.srsReview.findMany({
      where: { userId },
      select: { reviewHistory: true },
    });

    return rows.reduce((sum, row) => {
      const history = Array.isArray(row.reviewHistory)
        ? row.reviewHistory.length
        : 0;
      return sum + history;
    }, 0);
  }

  private resolveFavoriteModules(
    rows: Array<{ modulesUsed: string[] }>,
  ): string[] {
    const counts = new Map<string, number>();

    for (const row of rows) {
      for (const module of row.modulesUsed ?? []) {
        counts.set(module, (counts.get(module) ?? 0) + 1);
      }
    }

    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([module]) => module);
  }
}
