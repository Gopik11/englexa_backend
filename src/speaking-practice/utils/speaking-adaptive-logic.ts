import { LearnerLevel } from '../../content/englexa-content-spec.constants';
import { SpeakingTopic } from '../interfaces/speaking-prompt.interface';

export interface SpeakingTopicProgress {
  effectiveLevel: LearnerLevel;
  completedPromptIds: Set<string>;
  aiSequence: number;
  aiServed: number;
  totalServed: number;
  lowScoreCount: number;
}

const progressStore = new Map<string, SpeakingTopicProgress>();

function progressKey(userId: string, topic: SpeakingTopic): string {
  return `${userId}:${topic}`;
}

export function getOrCreateSpeakingTopicProgress(
  userId: string,
  topic: SpeakingTopic,
  level: LearnerLevel,
): SpeakingTopicProgress {
  const key = progressKey(userId, topic);
  const existing = progressStore.get(key);
  if (existing) {
    return existing;
  }

  const created: SpeakingTopicProgress = {
    effectiveLevel: level,
    completedPromptIds: new Set(),
    aiSequence: 0,
    aiServed: 0,
    totalServed: 0,
    lowScoreCount: 0,
  };
  progressStore.set(key, created);
  return created;
}

export function recordSpeakingAttempt(
  userId: string,
  topic: SpeakingTopic,
  averageScore: number,
): void {
  const progress = progressStore.get(progressKey(userId, topic));
  if (!progress) {
    return;
  }

  if (averageScore < 75) {
    progress.lowScoreCount += 1;
  } else if (progress.lowScoreCount > 0) {
    progress.lowScoreCount -= 1;
  }

  if (averageScore >= 85 && progress.effectiveLevel === 'beginner') {
    progress.effectiveLevel = 'intermediate';
  } else if (averageScore >= 90 && progress.effectiveLevel === 'intermediate') {
    progress.effectiveLevel = 'advanced';
  }
}

/** @internal Test helper */
export function clearSpeakingAdaptiveProgress(): void {
  progressStore.clear();
}
