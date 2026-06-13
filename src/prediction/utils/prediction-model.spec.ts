import {
  adaptiveLevelToFactor,
  computePrediction,
  recentAccuracy,
  srsDueToFactor,
} from './prediction-model';

describe('prediction-model', () => {
  it('computes score from weighted inputs', () => {
    const result = computePrediction({
      mastery_score: 85,
      recent_accuracy: 70,
      srs_factor: 100,
      adaptive_difficulty_factor: 80,
      error_pattern_count: 0,
      srs_overdue: false,
    });

    expect(result.score).toBe(84);
    expect(result.probability_correct).toBe(0.84);
    expect(result.predicted_difficulty).toBe(1);
    expect(result.recommended_action).toBe('boost');
  });

  it('flags mini lesson when error patterns exceed 3', () => {
    const result = computePrediction({
      mastery_score: 50,
      recent_accuracy: 50,
      srs_factor: 80,
      adaptive_difficulty_factor: 60,
      error_pattern_count: 4,
      srs_overdue: false,
    });

    expect(result.needs_mini_lesson).toBe(true);
    expect(result.recommended_action).toBe('mini_lesson');
  });

  it('recommends review for low mastery', () => {
    const result = computePrediction({
      mastery_score: 30,
      recent_accuracy: 40,
      srs_factor: 70,
      adaptive_difficulty_factor: 60,
      error_pattern_count: 1,
      srs_overdue: false,
    });

    expect(result.recommended_action).toBe('review');
  });

  it('maps adaptive difficulty to factor', () => {
    expect(adaptiveLevelToFactor(1)).toBe(100);
    expect(adaptiveLevelToFactor(5)).toBe(20);
  });

  it('reduces srs factor when overdue', () => {
    expect(srsDueToFactor(false)).toBe(100);
    expect(srsDueToFactor(true, 3)).toBeLessThan(100);
  });

  it('computes recent accuracy', () => {
    expect(recentAccuracy(7, 10)).toBe(70);
    expect(recentAccuracy(0, 0)).toBe(50);
  });
});
