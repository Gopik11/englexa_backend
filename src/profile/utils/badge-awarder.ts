import { BadgeAwardContext, BadgeDefinition } from '../entities/badge.entity';

export const PROFILE_BADGE_DEFINITIONS: Record<string, BadgeDefinition> = {
  XP_500: {
    id: 'XP_500',
    name: 'Rising Star',
    description: 'Earn 500 XP',
  },
  XP_1000: {
    id: 'XP_1000',
    name: 'XP Explorer',
    description: 'Earn 1,000 XP',
  },
  XP_5000: {
    id: 'XP_5000',
    name: 'XP Champion',
    description: 'Earn 5,000 XP',
  },
  STREAK_7: {
    id: 'STREAK_7',
    name: '7-Day Streak',
    description: 'Maintain a 7-day practice streak',
  },
  STREAK_30: {
    id: 'STREAK_30',
    name: '30-Day Streak',
    description: 'Maintain a 30-day practice streak',
  },
  GRAMMAR_MASTERY: {
    id: 'GRAMMAR_MASTERY',
    name: 'Grammar Ace',
    description: 'Reach 80% average grammar mastery',
  },
  VOCABULARY_MASTERY: {
    id: 'VOCABULARY_MASTERY',
    name: 'Word Wizard',
    description: 'Reach 80% average vocabulary mastery',
  },
  READING_MASTERY: {
    id: 'READING_MASTERY',
    name: 'Reading Pro',
    description: 'Reach 80% average reading mastery',
  },
  SRS_STARTER: {
    id: 'SRS_STARTER',
    name: 'Memory Keeper',
    description: 'Complete 10 SRS reviews',
  },
  SRS_MASTER: {
    id: 'SRS_MASTER',
    name: 'SRS Master',
    description: 'Complete 50 SRS reviews',
  },
  DAILY_CHALLENGER: {
    id: 'DAILY_CHALLENGER',
    name: 'Daily Challenger',
    description: 'Complete 7 daily challenges',
  },
  SPEAKING_VOICE: {
    id: 'SPEAKING_VOICE',
    name: 'Speaking Voice',
    description: 'Submit 25 speaking practice sessions',
  },
};

const MODULE_MASTERY_BADGES: Record<string, string> = {
  grammar: 'GRAMMAR_MASTERY',
  vocabulary: 'VOCABULARY_MASTERY',
  reading: 'READING_MASTERY',
};

export function resolveEarnedBadges(ctx: BadgeAwardContext): string[] {
  const earned: string[] = [];

  if (ctx.xp >= 500) earned.push('XP_500');
  if (ctx.xp >= 1000) earned.push('XP_1000');
  if (ctx.xp >= 5000) earned.push('XP_5000');
  if (ctx.streak >= 7) earned.push('STREAK_7');
  if (ctx.streak >= 30) earned.push('STREAK_30');
  if (ctx.srsReviewCount >= 10) earned.push('SRS_STARTER');
  if (ctx.srsReviewCount >= 50) earned.push('SRS_MASTER');
  if (ctx.dailyChallengesCompleted >= 7) earned.push('DAILY_CHALLENGER');
  if (ctx.speakingSubmissions >= 25) earned.push('SPEAKING_VOICE');

  for (const [module, badgeId] of Object.entries(MODULE_MASTERY_BADGES)) {
    const mastery = ctx.moduleMastery[module] ?? 0;
    if (mastery >= 80) {
      earned.push(badgeId);
    }
  }

  return [...new Set(earned)];
}
