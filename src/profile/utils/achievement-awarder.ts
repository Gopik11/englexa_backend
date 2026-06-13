import {
  AchievementAwardContext,
  AchievementDefinition,
} from '../entities/achievement.entity';

export const ACHIEVEMENT_DEFINITIONS: Record<string, AchievementDefinition> = {
  LESSONS_100: {
    id: 'LESSONS_100',
    name: 'Century Scholar',
    description: 'Complete 100 lessons',
    goal: 100,
  },
  CONCEPTS_MASTERED_10: {
    id: 'CONCEPTS_MASTERED_10',
    name: 'Concept Collector',
    description: 'Master 10 concepts',
    goal: 10,
  },
  SRS_REVIEWS_50: {
    id: 'SRS_REVIEWS_50',
    name: 'Spaced Repetition Pro',
    description: 'Complete 50 SRS reviews',
    goal: 50,
  },
  XP_1000: {
    id: 'XP_1000',
    name: '1K Club',
    description: 'Earn 1,000 XP',
    goal: 1000,
  },
  XP_5000: {
    id: 'XP_5000',
    name: '5K Club',
    description: 'Earn 5,000 XP',
    goal: 5000,
  },
  XP_10000: {
    id: 'XP_10000',
    name: '10K Legend',
    description: 'Earn 10,000 XP',
    goal: 10000,
  },
};

export function achievementProgress(
  achievementId: string,
  ctx: AchievementAwardContext,
): number {
  switch (achievementId) {
    case 'LESSONS_100':
      return ctx.lessonsCompleted;
    case 'CONCEPTS_MASTERED_10':
      return ctx.conceptsMastered;
    case 'SRS_REVIEWS_50':
      return ctx.srsReviewCount;
    case 'XP_1000':
    case 'XP_5000':
    case 'XP_10000':
      return ctx.xp;
    default:
      return 0;
  }
}

export function isAchievementEarned(
  achievementId: string,
  ctx: AchievementAwardContext,
): boolean {
  const def = ACHIEVEMENT_DEFINITIONS[achievementId];
  if (!def) return false;
  return achievementProgress(achievementId, ctx) >= def.goal;
}
