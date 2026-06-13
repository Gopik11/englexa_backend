import { LearnerLevel } from '../../content/englexa-content-spec.constants';
import { WritingTopic } from '../interfaces/writing-prompt.interface';

export interface WritingTopicProgress {
  effectiveLevel: LearnerLevel;
  completedPromptIds: Set<string>;
  lastServedPromptId: string | null;
  aiSequence: number;
  aiServed: number;
  totalServed: number;
  weakAttemptCount: number;
}

const progressStore = new Map<string, WritingTopicProgress>();

function progressKey(userId: string, topic: WritingTopic): string {
  return `${userId}:${topic}`;
}

export function getOrCreateWritingTopicProgress(
  userId: string,
  topic: WritingTopic,
  level: LearnerLevel,
): WritingTopicProgress {
  const key = progressKey(userId, topic);
  const existing = progressStore.get(key);
  if (existing) {
    return existing;
  }

  const created: WritingTopicProgress = {
    effectiveLevel: level,
    completedPromptIds: new Set(),
    lastServedPromptId: null,
    aiSequence: 0,
    aiServed: 0,
    totalServed: 0,
    weakAttemptCount: 0,
  };
  progressStore.set(key, created);
  return created;
}

export function recordWritingAttempt(
  userId: string,
  topic: WritingTopic,
  qualityScore: number,
): void {
  const progress = progressStore.get(progressKey(userId, topic));
  if (!progress) {
    return;
  }

  if (qualityScore < 70) {
    progress.weakAttemptCount += 1;
  } else if (progress.weakAttemptCount > 0) {
    progress.weakAttemptCount -= 1;
  }

  if (qualityScore >= 80 && progress.effectiveLevel === 'beginner') {
    progress.effectiveLevel = 'intermediate';
  } else if (qualityScore >= 85 && progress.effectiveLevel === 'intermediate') {
    progress.effectiveLevel = 'advanced';
  }
}

export function markPromptCompleted(
  userId: string,
  topic: WritingTopic,
  promptId: string,
): void {
  const progress = progressStore.get(progressKey(userId, topic));
  if (!progress) {
    return;
  }
  progress.completedPromptIds.add(promptId);
}

/** @internal Test helper */
export function clearWritingAdaptiveProgress(): void {
  progressStore.clear();
}
