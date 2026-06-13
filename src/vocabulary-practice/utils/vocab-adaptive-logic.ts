import { LearnerLevel } from '../../content/englexa-content-spec.constants';
import { VocabTopic } from '../interfaces/vocab-exercise.interface';

export interface VocabTopicProgress {
  completedIds: Set<string>;
  mistakeCount: number;
  correctStreak: number;
  effectiveLevel: LearnerLevel;
  aiSequence: number;
  totalServed: number;
  aiServed: number;
  targetWord: string | null;
}

export const VOCAB_MISTAKE_THRESHOLD = 2;
export const VOCAB_CORRECT_STREAK_FOR_LEVEL_UP = 3;
export const VOCAB_BATCH_SIZE = 10;

const progressStore = new Map<string, Map<VocabTopic, VocabTopicProgress>>();
const wordMistakeStore = new Map<string, Map<string, number>>();

export function getOrCreateVocabTopicProgress(
  userId: string,
  topic: VocabTopic,
  level: LearnerLevel,
): VocabTopicProgress {
  if (!progressStore.has(userId)) {
    progressStore.set(userId, new Map());
  }

  const userMap = progressStore.get(userId)!;
  if (!userMap.has(topic)) {
    userMap.set(topic, createTopicProgress(level));
  }

  return userMap.get(topic)!;
}

export function getVocabTopicProgress(
  userId: string,
  topic: VocabTopic,
): VocabTopicProgress | undefined {
  return progressStore.get(userId)?.get(topic);
}

export function recordVocabTopicMistake(userId: string, topic: VocabTopic): number {
  const progress = progressStore.get(userId)?.get(topic);
  if (!progress) {
    return 0;
  }

  progress.mistakeCount += 1;
  progress.correctStreak = 0;
  return progress.mistakeCount;
}

export function recordVocabWordMistake(userId: string, wordKey: string): number {
  if (!wordMistakeStore.has(userId)) {
    wordMistakeStore.set(userId, new Map());
  }

  const userWords = wordMistakeStore.get(userId)!;
  const nextCount = (userWords.get(wordKey) ?? 0) + 1;
  userWords.set(wordKey, nextCount);
  return nextCount;
}

export function recordVocabWordCorrect(userId: string, wordKey: string): void {
  const userWords = wordMistakeStore.get(userId);
  if (!userWords?.has(wordKey)) {
    return;
  }

  const nextCount = Math.max(0, (userWords.get(wordKey) ?? 0) - 1);
  if (nextCount === 0) {
    userWords.delete(wordKey);
  } else {
    userWords.set(wordKey, nextCount);
  }
}

export function getVocabWordMistakeCount(userId: string, wordKey: string): number {
  return wordMistakeStore.get(userId)?.get(wordKey) ?? 0;
}

export function shouldShowVocabMicroLesson(userId: string, wordKey: string): boolean {
  return getVocabWordMistakeCount(userId, wordKey) >= VOCAB_MISTAKE_THRESHOLD;
}

export function shouldGenerateAIVocabExercise(
  userId: string,
  topic: VocabTopic,
): boolean {
  const progress = progressStore.get(userId)?.get(topic);
  if (progress && progress.mistakeCount >= VOCAB_MISTAKE_THRESHOLD) {
    return true;
  }

  return getStrugglingWordsForTopic(userId, topic).length > 0;
}

export function getStrugglingWordsForTopic(
  userId: string,
  topic: VocabTopic,
): string[] {
  const progress = progressStore.get(userId)?.get(topic);
  if (!progress) {
    return [];
  }

  const words: string[] = [];
  const userWords = wordMistakeStore.get(userId);
  if (!userWords) {
    return words;
  }

  for (const [word, count] of userWords.entries()) {
    if (count >= VOCAB_MISTAKE_THRESHOLD) {
      words.push(word);
    }
  }

  if (progress.mistakeCount >= VOCAB_MISTAKE_THRESHOLD && progress.targetWord) {
    words.push(progress.targetWord);
  }

  return [...new Set(words)];
}

export function getWeakestWordForTopic(
  userId: string,
  topic: VocabTopic,
): string | null {
  const userWords = wordMistakeStore.get(userId);
  if (!userWords) {
    return null;
  }

  let weakest: string | null = null;
  let highestCount = 0;

  for (const [word, count] of userWords.entries()) {
    if (count > highestCount) {
      highestCount = count;
      weakest = word;
    }
  }

  return highestCount >= VOCAB_MISTAKE_THRESHOLD ? weakest : null;
}

export function recordVocabTopicCorrect(
  userId: string,
  topic: VocabTopic,
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

export function getNextVocabDifficulty(level: LearnerLevel): LearnerLevel {
  if (level === 'beginner') {
    return 'intermediate';
  }
  if (level === 'intermediate') {
    return 'advanced';
  }
  return 'advanced';
}

function applyLevelUpIfReady(progress: VocabTopicProgress): void {
  if (progress.correctStreak < VOCAB_CORRECT_STREAK_FOR_LEVEL_UP) {
    return;
  }

  progress.effectiveLevel = getNextVocabDifficulty(progress.effectiveLevel);
  progress.correctStreak = 0;
}

function createTopicProgress(level: LearnerLevel): VocabTopicProgress {
  return {
    completedIds: new Set(),
    mistakeCount: 0,
    correctStreak: 0,
    effectiveLevel: level,
    aiSequence: 0,
    totalServed: 0,
    aiServed: 0,
    targetWord: null,
  };
}

/** @internal Resets in-memory state between tests. */
export function clearVocabAdaptiveProgress(): void {
  progressStore.clear();
  wordMistakeStore.clear();
}
