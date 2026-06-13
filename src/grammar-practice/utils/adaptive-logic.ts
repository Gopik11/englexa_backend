import { LearnerLevel } from '../../content/englexa-content-spec.constants';
import { GrammarTopic } from '../interfaces/grammar-exercise.interface';
import { conceptsForTopic } from './concept-detector';

export interface TopicProgress {
  completedIds: Set<string>;
  mistakeCount: number;
  correctStreak: number;
  effectiveLevel: LearnerLevel;
  aiSequence: number;
  totalServed: number;
  aiServed: number;
  /** Weak concept targeted for the next AI batch, if any. */
  targetConcept: string | null;
}

export const MISTAKE_THRESHOLD = 2;
export const CORRECT_STREAK_FOR_LEVEL_UP = 3;
export const BATCH_SIZE = 10;

/** userId → topic → progress (in-memory) */
const progressStore = new Map<string, Map<GrammarTopic, TopicProgress>>();

/** userId → concept label → mistake count (in-memory, cross-topic) */
const conceptMistakeStore = new Map<string, Map<string, number>>();

export function getOrCreateTopicProgress(
  userId: string,
  topic: GrammarTopic,
  level: LearnerLevel,
): TopicProgress {
  if (!progressStore.has(userId)) {
    progressStore.set(userId, new Map());
  }

  const userMap = progressStore.get(userId)!;
  if (!userMap.has(topic)) {
    userMap.set(topic, createTopicProgress(level));
  }

  return userMap.get(topic)!;
}

export function getTopicProgress(
  userId: string,
  topic: GrammarTopic,
): TopicProgress | undefined {
  return progressStore.get(userId)?.get(topic);
}

/** Increments mistake count for a user/topic. Returns the updated count. */
export function recordMistake(userId: string, topic: GrammarTopic): number {
  const progress = progressStore.get(userId)?.get(topic);
  if (!progress) {
    return 0;
  }

  progress.mistakeCount += 1;
  progress.correctStreak = 0;
  return progress.mistakeCount;
}

/**
 * Tracks mistakes per grammar concept (e.g. "Articles", "Past Tense").
 * Call from submitAnswer() after identifyConcept().
 */
export function recordConceptMistake(userId: string, concept: string): number {
  if (!conceptMistakeStore.has(userId)) {
    conceptMistakeStore.set(userId, new Map());
  }

  const userConcepts = conceptMistakeStore.get(userId)!;
  const nextCount = (userConcepts.get(concept) ?? 0) + 1;
  userConcepts.set(concept, nextCount);
  return nextCount;
}

/** Reduces concept mistake count after a correct answer on that concept. */
export function recordConceptCorrect(userId: string, concept: string): void {
  const userConcepts = conceptMistakeStore.get(userId);
  if (!userConcepts?.has(concept)) {
    return;
  }

  const nextCount = Math.max(0, (userConcepts.get(concept) ?? 0) - 1);
  if (nextCount === 0) {
    userConcepts.delete(concept);
  } else {
    userConcepts.set(concept, nextCount);
  }
}

export function getConceptMistakeCount(userId: string, concept: string): number {
  return conceptMistakeStore.get(userId)?.get(concept) ?? 0;
}

/**
 * True when the learner has made 2+ mistakes on the same concept.
 * Used to attach a micro-lesson in submitAnswer().
 */
export function shouldShowMicroLesson(userId: string, concept: string): boolean {
  return getConceptMistakeCount(userId, concept) >= MISTAKE_THRESHOLD;
}

/**
 * True when a concept has reached the mistake threshold.
 * Used to optionally mix AI exercises targeting that concept.
 */
export function shouldGenerateAIExerciseForConcept(
  userId: string,
  concept: string,
): boolean {
  return shouldShowMicroLesson(userId, concept);
}

/** Returns concepts for a topic that have hit the mistake threshold. */
export function getStrugglingConceptsForTopic(
  userId: string,
  topic: GrammarTopic,
): string[] {
  return conceptsForTopic(topic).filter((concept) =>
    shouldGenerateAIExerciseForConcept(userId, concept),
  );
}

/** Returns the highest-mistake concept for a topic at or above the threshold. */
export function getWeakestConceptForTopic(
  userId: string,
  topic: GrammarTopic,
): string | null {
  const concepts = conceptsForTopic(topic);
  let weakest: string | null = null;
  let highestCount = 0;

  for (const concept of concepts) {
    const count = getConceptMistakeCount(userId, concept);
    if (count > highestCount) {
      highestCount = count;
      weakest = concept;
    }
  }

  return highestCount >= MISTAKE_THRESHOLD ? weakest : null;
}

/** Records a correct answer and applies level-up when the streak threshold is met. */
export function recordCorrect(
  userId: string,
  topic: GrammarTopic,
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

/**
 * True when AI exercises should be mixed into the next batch:
 * - 2+ topic-level mistakes, OR
 * - 2+ mistakes on any concept linked to this topic.
 */
export function shouldGenerateAIExercise(
  userId: string,
  topic: GrammarTopic,
): boolean {
  const progress = progressStore.get(userId)?.get(topic);
  if (progress && progress.mistakeCount >= MISTAKE_THRESHOLD) {
    return true;
  }

  return getStrugglingConceptsForTopic(userId, topic).length > 0;
}

/** Returns the next difficulty level (caps at advanced). */
export function getNextDifficulty(level: LearnerLevel): LearnerLevel {
  if (level === 'beginner') {
    return 'intermediate';
  }
  if (level === 'intermediate') {
    return 'advanced';
  }
  return 'advanced';
}

function applyLevelUpIfReady(progress: TopicProgress): void {
  if (progress.correctStreak < CORRECT_STREAK_FOR_LEVEL_UP) {
    return;
  }

  progress.effectiveLevel = getNextDifficulty(progress.effectiveLevel);
  progress.correctStreak = 0;
}

function createTopicProgress(level: LearnerLevel): TopicProgress {
  return {
    completedIds: new Set(),
    mistakeCount: 0,
    correctStreak: 0,
    effectiveLevel: level,
    aiSequence: 0,
    totalServed: 0,
    aiServed: 0,
    targetConcept: null,
  };
}

/** @internal Resets in-memory state between tests. */
export function clearAdaptiveProgress(): void {
  progressStore.clear();
  conceptMistakeStore.clear();
}
