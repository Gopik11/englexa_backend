import { DifficultyState } from '../entities/difficulty.entity';

const MIN_DIFFICULTY = 1;
const MAX_DIFFICULTY = 5;
const STREAK_THRESHOLD = 3;
const INCORRECT_THRESHOLD = 3;

export function clampDifficulty(level: number): number {
  return Math.max(MIN_DIFFICULTY, Math.min(MAX_DIFFICULTY, level));
}

export function applyAnswerToDifficulty(
  state: Pick<
    DifficultyState,
    'attempts' | 'correct' | 'incorrect' | 'streak' | 'difficulty_level'
  >,
  isCorrect: boolean,
): Pick<
  DifficultyState,
  'attempts' | 'correct' | 'incorrect' | 'streak' | 'difficulty_level'
> {
  let {
    attempts,
    correct,
    incorrect,
    streak,
    difficulty_level: difficultyLevel,
  } = state;

  attempts += 1;

  if (isCorrect) {
    correct += 1;
    streak += 1;
    incorrect = 0;
  } else {
    incorrect += 1;
    streak = 0;
  }

  if (streak >= STREAK_THRESHOLD) {
    difficultyLevel = clampDifficulty(difficultyLevel + 1);
    streak = 0;
  }

  if (incorrect >= INCORRECT_THRESHOLD) {
    difficultyLevel = clampDifficulty(difficultyLevel - 1);
    incorrect = 0;
  }

  return {
    attempts,
    correct,
    incorrect,
    streak,
    difficulty_level: difficultyLevel,
  };
}

export function adjustDifficultyLevel(
  currentLevel: number,
  streak: number,
  incorrect: number,
): number {
  let difficultyLevel = currentLevel;

  if (streak >= STREAK_THRESHOLD) {
    difficultyLevel = clampDifficulty(difficultyLevel + 1);
  }

  if (incorrect >= INCORRECT_THRESHOLD) {
    difficultyLevel = clampDifficulty(difficultyLevel - 1);
  }

  return difficultyLevel;
}
