import { VocabExercise, VocabExercisePublic } from '../interfaces/vocab-exercise.interface';
import {
  isSemanticallySimilar,
  normalizeAnswer,
} from '../../grammar-practice/utils/semantic-similarity';

export { normalizeAnswer } from '../../grammar-practice/utils/semantic-similarity';

export interface VocabAnswerEvaluation {
  isCorrect: boolean;
  normalizedUserAnswer: string;
  normalizedCorrectAnswer: string;
}

export function isVocabAnswerCorrect(
  submitted: string,
  expected: string,
  alternatives: string[] = [],
): boolean {
  const candidates = [expected, ...alternatives];
  return candidates.some((candidate) => isSemanticallySimilar(submitted, candidate));
}

export function evaluateVocabAnswer(
  submitted: string,
  exercise: Pick<VocabExercise, 'correct_answer' | 'alternatives'>,
): VocabAnswerEvaluation {
  return {
    isCorrect: isVocabAnswerCorrect(
      submitted,
      exercise.correct_answer,
      exercise.alternatives ?? [],
    ),
    normalizedUserAnswer: normalizeAnswer(submitted),
    normalizedCorrectAnswer: normalizeAnswer(exercise.correct_answer),
  };
}

export function extractWordKey(exercise: Pick<VocabExercise, 'correct_answer'>): string {
  return normalizeAnswer(exercise.correct_answer);
}

export function toPublicVocabExercise(exercise: VocabExercise): VocabExercisePublic {
  return {
    id: exercise.id,
    level: exercise.level,
    topic: exercise.topic,
    type: exercise.type,
    question: exercise.question,
    options: exercise.options,
  };
}
