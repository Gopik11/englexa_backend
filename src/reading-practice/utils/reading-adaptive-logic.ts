import { LearnerLevel } from '../../content/englexa-content-spec.constants';
import { ReadingTopic } from '../interfaces/reading-passage.interface';

export interface ReadingTopicProgress {
  completedPassageIds: Set<string>;
  answeredQuestionIds: Set<string>;
  mistakeCount: number;
  correctStreak: number;
  effectiveLevel: LearnerLevel;
  aiSequence: number;
  totalServed: number;
  aiServed: number;
}

export const READING_MISTAKE_THRESHOLD = 2;
export const READING_CORRECT_STREAK_FOR_LEVEL_UP = 3;

const progressStore = new Map<string, Map<ReadingTopic, ReadingTopicProgress>>();
const questionMistakeStore = new Map<string, Map<string, number>>();

export function getOrCreateReadingTopicProgress(
  userId: string,
  topic: ReadingTopic,
  level: LearnerLevel,
): ReadingTopicProgress {
  if (!progressStore.has(userId)) {
    progressStore.set(userId, new Map());
  }

  const userMap = progressStore.get(userId)!;
  if (!userMap.has(topic)) {
    userMap.set(topic, createTopicProgress(level));
  }

  return userMap.get(topic)!;
}

export function recordReadingMistake(userId: string, topic: ReadingTopic): number {
  const progress = progressStore.get(userId)?.get(topic);
  if (!progress) {
    return 0;
  }

  progress.mistakeCount += 1;
  progress.correctStreak = 0;
  return progress.mistakeCount;
}

export function recordReadingQuestionMistake(
  userId: string,
  questionKey: string,
): number {
  if (!questionMistakeStore.has(userId)) {
    questionMistakeStore.set(userId, new Map());
  }

  const userQuestions = questionMistakeStore.get(userId)!;
  const nextCount = (userQuestions.get(questionKey) ?? 0) + 1;
  userQuestions.set(questionKey, nextCount);
  return nextCount;
}

export function recordReadingQuestionCorrect(
  userId: string,
  questionKey: string,
): void {
  const userQuestions = questionMistakeStore.get(userId);
  if (!userQuestions?.has(questionKey)) {
    return;
  }

  const nextCount = Math.max(0, (userQuestions.get(questionKey) ?? 0) - 1);
  if (nextCount === 0) {
    userQuestions.delete(questionKey);
  } else {
    userQuestions.set(questionKey, nextCount);
  }
}

export function recordReadingCorrect(
  userId: string,
  topic: ReadingTopic,
): LearnerLevel {
  const progress = progressStore.get(userId)?.get(topic);
  if (!progress) {
    return 'intermediate';
  }

  progress.correctStreak += 1;
  progress.mistakeCount = Math.max(0, progress.mistakeCount - 1);
  applyLevelUpIfReady(progress);
  return progress.effectiveLevel;
}

export function shouldGenerateAIReadingPassage(
  userId: string,
  topic: ReadingTopic,
): boolean {
  const progress = progressStore.get(userId)?.get(topic);
  return (progress?.mistakeCount ?? 0) >= READING_MISTAKE_THRESHOLD;
}

export function getNextReadingDifficulty(level: LearnerLevel): LearnerLevel {
  if (level === 'beginner') {
    return 'intermediate';
  }
  if (level === 'intermediate') {
    return 'advanced';
  }
  return 'advanced';
}

function applyLevelUpIfReady(progress: ReadingTopicProgress): void {
  if (progress.correctStreak < READING_CORRECT_STREAK_FOR_LEVEL_UP) {
    return;
  }

  progress.effectiveLevel = getNextReadingDifficulty(progress.effectiveLevel);
  progress.correctStreak = 0;
}

function createTopicProgress(level: LearnerLevel): ReadingTopicProgress {
  return {
    completedPassageIds: new Set(),
    answeredQuestionIds: new Set(),
    mistakeCount: 0,
    correctStreak: 0,
    effectiveLevel: level,
    aiSequence: 0,
    totalServed: 0,
    aiServed: 0,
  };
}

/** @internal Resets in-memory state between tests. */
export function clearReadingAdaptiveProgress(): void {
  progressStore.clear();
  questionMistakeStore.clear();
}
