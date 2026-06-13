import {
  BadgeDefinition,
  BadgeId,
  PracticeStatsSnapshot,
} from '../entities/badge.entity';

export const BADGE_DEFINITIONS: Record<BadgeId, BadgeDefinition> = {
  [BadgeId.GRAMMAR_MASTER]: {
    id: BadgeId.GRAMMAR_MASTER,
    title: 'Grammar Master',
    description: '100 correct grammar answers',
  },
  [BadgeId.VOCABULARY_EXPLORER]: {
    id: BadgeId.VOCABULARY_EXPLORER,
    title: 'Vocabulary Explorer',
    description: '200 vocabulary words learned',
  },
  [BadgeId.READING_CHAMPION]: {
    id: BadgeId.READING_CHAMPION,
    title: 'Reading Champion',
    description: '20 reading passages completed',
  },
  [BadgeId.SPEAKING_STAR]: {
    id: BadgeId.SPEAKING_STAR,
    title: 'Speaking Star',
    description: '50 speaking recordings submitted',
  },
  [BadgeId.WRITING_PRO]: {
    id: BadgeId.WRITING_PRO,
    title: 'Writing Pro',
    description: '10 essays submitted',
  },
  [BadgeId.STREAK_7]: {
    id: BadgeId.STREAK_7,
    title: '7-Day Streak',
    description: 'Practice 7 days in a row',
  },
  [BadgeId.STREAK_30]: {
    id: BadgeId.STREAK_30,
    title: '30-Day Streak',
    description: 'Practice 30 days in a row',
  },
  [BadgeId.FIRST_LESSON]: {
    id: BadgeId.FIRST_LESSON,
    title: 'First Steps',
    description: 'Complete your first lesson',
  },
  [BadgeId.XP_500]: {
    id: BadgeId.XP_500,
    title: 'Rising Star',
    description: 'Earn 500 XP',
  },
  [BadgeId.MISSION_MASTER]: {
    id: BadgeId.MISSION_MASTER,
    title: 'Mission Master',
    description: 'Complete 5 daily missions',
  },
};

export function resolveUnlockedBadges(
  stats: PracticeStatsSnapshot,
): BadgeId[] {
  const badges: BadgeId[] = [];

  if (stats.grammarCorrect >= 100) badges.push(BadgeId.GRAMMAR_MASTER);
  if (stats.vocabularyCorrect >= 200) badges.push(BadgeId.VOCABULARY_EXPLORER);
  if (stats.readingCompleted >= 20) badges.push(BadgeId.READING_CHAMPION);
  if (stats.speakingSubmissions >= 50) badges.push(BadgeId.SPEAKING_STAR);
  if (stats.writingSubmissions >= 10) badges.push(BadgeId.WRITING_PRO);
  if (stats.streak >= 7) badges.push(BadgeId.STREAK_7);
  if (stats.streak >= 30) badges.push(BadgeId.STREAK_30);
  if (stats.completedLessons >= 1) badges.push(BadgeId.FIRST_LESSON);
  if (stats.xp >= 500) badges.push(BadgeId.XP_500);
  if (stats.missionCount >= 5) badges.push(BadgeId.MISSION_MASTER);

  return badges;
}
