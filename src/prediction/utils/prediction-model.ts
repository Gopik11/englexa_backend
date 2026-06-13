export interface PredictionInputs {
  mastery_score: number;
  recent_accuracy: number;
  srs_factor: number;
  adaptive_difficulty_factor: number;
  error_pattern_count: number;
  srs_overdue: boolean;
}

export interface PredictionOutput {
  score: number;
  probability_correct: number;
  predicted_difficulty: number;
  needs_review: boolean;
  needs_mini_lesson: boolean;
  recommended_action: 'review' | 'boost' | 'practice' | 'mini_lesson';
}

export function computePrediction(inputs: PredictionInputs): PredictionOutput {
  const mastery = clamp(inputs.mastery_score, 0, 100);
  const accuracy = clamp(inputs.recent_accuracy, 0, 100);
  const srs = clamp(inputs.srs_factor, 0, 100);
  const adaptive = clamp(inputs.adaptive_difficulty_factor, 0, 100);

  const score =
    0.4 * mastery +
    0.2 * accuracy +
    0.2 * srs +
    0.2 * adaptive;

  const probability_correct = round2(score / 100);
  const predicted_difficulty = clamp(
    5 - Math.floor(score / 20),
    1,
    5,
  );

  const needs_mini_lesson = inputs.error_pattern_count > 3;
  const needs_review = inputs.srs_overdue;

  let recommended_action: PredictionOutput['recommended_action'] = 'practice';
  if (needs_mini_lesson) {
    recommended_action = 'mini_lesson';
  } else if (mastery < 40) {
    recommended_action = 'review';
  } else if (mastery > 80) {
    recommended_action = 'boost';
  } else if (needs_review) {
    recommended_action = 'review';
  }

  return {
    score: round2(score),
    probability_correct,
    predicted_difficulty,
    needs_review,
    needs_mini_lesson,
    recommended_action,
  };
}

export function adaptiveLevelToFactor(difficultyLevel: number): number {
  const level = clamp(difficultyLevel, 1, 5);
  return (6 - level) * 20;
}

export function srsDueToFactor(isOverdue: boolean, daysOverdue = 0): number {
  if (!isOverdue) {
    return 100;
  }
  return clamp(100 - daysOverdue * 15, 20, 100);
}

export function recentAccuracy(correct: number, attempts: number): number {
  if (attempts <= 0) {
    return 50;
  }
  return clamp(Math.round((correct / attempts) * 100), 0, 100);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
