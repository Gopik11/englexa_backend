import { GrammarExercise } from '../interfaces/grammar-exercise.interface';
import { AiExerciseGenerator } from './ai-exercise-generator';
import {
  isSemanticallySimilar,
  normalizeAnswer,
  semanticSimilarity,
} from './semantic-similarity';

export { normalizeAnswer, semanticSimilarity } from './semantic-similarity';

export interface AnswerEvaluationResult {
  isCorrect: boolean;
  normalizedUserAnswer: string;
  normalizedCorrectAnswer: string;
}

export function matchesExpectedAnswer(submitted: string, expected: string): boolean {
  return isSemanticallySimilar(submitted, expected);
}

export function isAnswerCorrect(
  submitted: string,
  expected: string,
  alternatives: string[] = [],
): boolean {
  const candidates = [expected, ...alternatives];
  return candidates.some((candidate) => matchesExpectedAnswer(submitted, candidate));
}

export function evaluateExerciseAnswer(
  submitted: string,
  exercise: Pick<GrammarExercise, 'correct_answer' | 'alternatives'>,
): AnswerEvaluationResult {
  const normalizedUserAnswer = normalizeAnswer(submitted);
  const normalizedCorrectAnswer = normalizeAnswer(exercise.correct_answer);

  return {
    isCorrect: isAnswerCorrect(
      submitted,
      exercise.correct_answer,
      exercise.alternatives ?? [],
    ),
    normalizedUserAnswer,
    normalizedCorrectAnswer,
  };
}

/** Builds the learner sentence passed into TutorFeedbackService — not tutor logic. */
export function buildTutorInputSentence(
  exercise: GrammarExercise,
  userAnswer: string,
  aiGenerator: AiExerciseGenerator,
): string {
  const trimmed = userAnswer.trim();

  if (exercise.type === 'correction' || exercise.type === 'rewrite') {
    return trimmed || aiGenerator.getSampleWrongSentence(exercise);
  }

  if (exercise.type === 'fill_blank' && exercise.question.includes('___')) {
    return exercise.question.replace('___', trimmed || '___');
  }

  return trimmed || aiGenerator.getSampleWrongSentence(exercise);
}

export function toPublicExercise(
  exercise: GrammarExercise,
): Omit<GrammarExercise, 'correct_answer' | 'explanation' | 'alternatives'> {
  return {
    id: exercise.id,
    level: exercise.level,
    topic: exercise.topic,
    type: exercise.type,
    question: exercise.question,
    options: exercise.options,
  };
}
