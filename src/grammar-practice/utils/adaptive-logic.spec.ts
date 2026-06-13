import { GrammarTopic } from '../interfaces/grammar-exercise.interface';
import {
  clearAdaptiveProgress,
  CORRECT_STREAK_FOR_LEVEL_UP,
  getStrugglingConceptsForTopic,
  getConceptMistakeCount,
  getNextDifficulty,
  getOrCreateTopicProgress,
  getTopicProgress,
  MISTAKE_THRESHOLD,
  recordConceptMistake,
  recordCorrect,
  recordMistake,
  shouldGenerateAIExercise,
  shouldGenerateAIExerciseForConcept,
  shouldShowMicroLesson,
} from './adaptive-logic';

describe('adaptive-logic', () => {
  const userId = 'user-1';
  const topic = 'articles' as GrammarTopic;

  beforeEach(() => {
    clearAdaptiveProgress();
    getOrCreateTopicProgress(userId, topic, 'beginner');
  });

  describe('recordMistake', () => {
    it('tracks mistakes per topic', () => {
      expect(recordMistake(userId, topic)).toBe(1);
      expect(recordMistake(userId, topic)).toBe(2);
      expect(getTopicProgress(userId, topic)?.mistakeCount).toBe(2);
    });

    it('resets correct streak on mistake', () => {
      recordCorrect(userId, topic);
      recordMistake(userId, topic);
      expect(getTopicProgress(userId, topic)?.correctStreak).toBe(0);
    });
  });

  describe('shouldGenerateAIExercise', () => {
    it('returns false below threshold', () => {
      recordMistake(userId, topic);
      expect(shouldGenerateAIExercise(userId, topic)).toBe(false);
    });

    it('returns true at 2+ mistakes', () => {
      recordMistake(userId, topic);
      recordMistake(userId, topic);
      expect(shouldGenerateAIExercise(userId, topic)).toBe(true);
    });
  });

  describe('getNextDifficulty', () => {
    it('steps beginner → intermediate → advanced', () => {
      expect(getNextDifficulty('beginner')).toBe('intermediate');
      expect(getNextDifficulty('intermediate')).toBe('advanced');
      expect(getNextDifficulty('advanced')).toBe('advanced');
    });
  });

  describe('recordCorrect / level up', () => {
    it('increases difficulty after consecutive correct answers', () => {
      for (let i = 0; i < CORRECT_STREAK_FOR_LEVEL_UP; i += 1) {
        recordCorrect(userId, topic);
      }
      expect(getTopicProgress(userId, topic)?.effectiveLevel).toBe(
        'intermediate',
      );
    });

    it('reduces mistake count on correct answers', () => {
      recordMistake(userId, topic);
      recordMistake(userId, topic);
      recordCorrect(userId, topic);
      expect(getTopicProgress(userId, topic)?.mistakeCount).toBe(1);
    });
  });

  it('isolates progress by topic', () => {
    const otherTopic = 'prepositions' as GrammarTopic;
    getOrCreateTopicProgress(userId, otherTopic, 'beginner');

    recordMistake(userId, topic);
    recordMistake(userId, topic);

    expect(shouldGenerateAIExercise(userId, topic)).toBe(true);
    expect(shouldGenerateAIExercise(userId, otherTopic)).toBe(false);
  });

  it('uses MISTAKE_THRESHOLD of 2', () => {
    expect(MISTAKE_THRESHOLD).toBe(2);
  });

  describe('concept-level tracking', () => {
    it('tracks mistakes per concept', () => {
      expect(recordConceptMistake(userId, 'Articles')).toBe(1);
      expect(recordConceptMistake(userId, 'Articles')).toBe(2);
      expect(getConceptMistakeCount(userId, 'Articles')).toBe(2);
    });

    it('shows micro-lessons after repeated concept mistakes', () => {
      recordConceptMistake(userId, 'Articles');
      expect(shouldShowMicroLesson(userId, 'Articles')).toBe(false);
      recordConceptMistake(userId, 'Articles');
      expect(shouldShowMicroLesson(userId, 'Articles')).toBe(true);
    });

    it('triggers AI exercises from concept mistakes on a topic', () => {
      recordConceptMistake(userId, 'Articles');
      recordConceptMistake(userId, 'Articles');
      expect(shouldGenerateAIExerciseForConcept(userId, 'Articles')).toBe(true);
      expect(getStrugglingConceptsForTopic(userId, topic)).toEqual(['Articles']);
      expect(shouldGenerateAIExercise(userId, topic)).toBe(true);
    });

    it('isolates concept mistakes across topics', () => {
      recordConceptMistake(userId, 'Articles');
      recordConceptMistake(userId, 'Articles');
      expect(shouldShowMicroLesson(userId, 'Prepositions')).toBe(false);
    });
  });
});
