import { applySrsRating, defaultEaseFactor, defaultInterval } from './srs-scheduler';

describe('srs-scheduler', () => {
  it('resets interval on again rating', () => {
    const result = applySrsRating({
      interval: 10,
      ease_factor: 2.0,
      rating: 'again',
    });

    expect(result.interval).toBe(1);
    expect(result.ease_factor).toBe(1.8);
  });

  it('increases interval on good rating', () => {
    const result = applySrsRating({
      interval: 2,
      ease_factor: 2.0,
      rating: 'good',
    });

    expect(result.interval).toBe(3);
    expect(result.ease_factor).toBe(2.0);
  });

  it('boosts interval and ease on easy rating', () => {
    const result = applySrsRating({
      interval: 2,
      ease_factor: 2.0,
      rating: 'easy',
    });

    expect(result.interval).toBe(4);
    expect(result.ease_factor).toBe(2.1);
  });

  it('clamps ease factor between 1.3 and 2.5', () => {
    const low = applySrsRating({
      interval: 5,
      ease_factor: 1.3,
      rating: 'again',
    });
    expect(low.ease_factor).toBeGreaterThanOrEqual(1.3);

    const high = applySrsRating({
      interval: 5,
      ease_factor: 2.5,
      rating: 'easy',
    });
    expect(high.ease_factor).toBeLessThanOrEqual(2.5);
  });

  it('provides defaults', () => {
    expect(defaultInterval()).toBe(1);
    expect(defaultEaseFactor()).toBe(2.0);
  });
});
