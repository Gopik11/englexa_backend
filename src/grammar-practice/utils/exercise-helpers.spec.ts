import {
  evaluateExerciseAnswer,
  isAnswerCorrect,
  matchesExpectedAnswer,
} from './exercise-helpers';
import { normalizeAnswer } from './semantic-similarity';

describe('exercise-helpers', () => {
  describe('isAnswerCorrect', () => {
    it('accepts exact matches after normalization', () => {
      expect(isAnswerCorrect('A', 'a')).toBe(true);
      expect(isAnswerCorrect('walked.', 'walked')).toBe(true);
    });

    it('accepts semantically similar answers above threshold', () => {
      expect(
        matchesExpectedAnswer(
          'She walks to work every day',
          'She walks to work every day.',
        ),
      ).toBe(true);
    });

    it('accepts alternative correct answers', () => {
      expect(isAnswerCorrect('an', 'a', ['an', 'the'])).toBe(true);
    });
  });

  describe('evaluateExerciseAnswer', () => {
    it('returns isCorrect and normalized answers', () => {
      const result = evaluateExerciseAnswer('  A.  ', {
        correct_answer: 'a',
        alternatives: ['an'],
      });

      expect(result).toEqual({
        isCorrect: true,
        normalizedUserAnswer: 'a',
        normalizedCorrectAnswer: 'a',
      });
    });

    it('marks incorrect answers with normalized forms', () => {
      const result = evaluateExerciseAnswer('the', {
        correct_answer: 'a',
        alternatives: [],
      });

      expect(result.isCorrect).toBe(false);
      expect(result.normalizedUserAnswer).toBe(normalizeAnswer('the'));
      expect(result.normalizedCorrectAnswer).toBe('a');
    });

    it('accepts matching alternatives', () => {
      const result = evaluateExerciseAnswer('an', {
        correct_answer: 'a',
        alternatives: ['an'],
      });

      expect(result.isCorrect).toBe(true);
    });
  });
});
