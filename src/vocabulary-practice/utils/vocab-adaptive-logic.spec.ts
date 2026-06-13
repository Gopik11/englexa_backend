import {
  clearVocabAdaptiveProgress,
  getOrCreateVocabTopicProgress,
  getVocabWordMistakeCount,
  getWeakestWordForTopic,
  recordVocabTopicMistake,
  recordVocabWordMistake,
  shouldGenerateAIVocabExercise,
  shouldShowVocabMicroLesson,
  VOCAB_MISTAKE_THRESHOLD,
} from './vocab-adaptive-logic';

describe('vocab-adaptive-logic', () => {
  beforeEach(() => {
    clearVocabAdaptiveProgress();
  });

  it('tracks mistakes per word and topic', () => {
    const userId = 'user-1';
    const topic = 'common_nouns' as const;

    getOrCreateVocabTopicProgress(userId, topic, 'beginner');
    recordVocabWordMistake(userId, 'water');
    const topicCount = recordVocabTopicMistake(userId, topic);

    expect(getVocabWordMistakeCount(userId, 'water')).toBe(1);
    expect(topicCount).toBe(1);
  });

  it('triggers AI and micro-lesson thresholds at 2 mistakes', () => {
    const userId = 'user-2';
    const topic = 'idioms' as const;

    getOrCreateVocabTopicProgress(userId, topic, 'advanced');
    recordVocabWordMistake(userId, 'break the ice');
    recordVocabWordMistake(userId, 'break the ice');

    expect(shouldShowVocabMicroLesson(userId, 'break the ice')).toBe(true);
    expect(getWeakestWordForTopic(userId, topic)).toBe('break the ice');

    recordVocabTopicMistake(userId, topic);
    recordVocabTopicMistake(userId, topic);

    expect(shouldGenerateAIVocabExercise(userId, topic)).toBe(true);
    expect(VOCAB_MISTAKE_THRESHOLD).toBe(2);
  });
});
