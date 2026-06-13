import {
  baseXpForSource,
  calculateXpAward,
  computeLevel,
  streakBonusXp,
} from './xp-calculator';

describe('xp-calculator', () => {
  it('returns base XP per activity source', () => {
    expect(baseXpForSource('lesson')).toBe(20);
    expect(baseXpForSource('daily_challenge')).toBe(30);
    expect(baseXpForSource('speaking')).toBe(40);
    expect(baseXpForSource('mini_lesson')).toBe(10);
    expect(baseXpForSource('srs_review')).toBe(15);
  });

  it('adds streak bonus and perfect accuracy', () => {
    const total = calculateXpAward({
      source: 'lesson',
      streak: 3,
      perfectAccuracy: true,
    });

    expect(total).toBe(20 + 15 + 10);
  });

  it('computes level from XP', () => {
    expect(computeLevel(0).level).toBe(1);
    expect(computeLevel(250).level).toBe(2);
    expect(streakBonusXp(4)).toBe(20);
  });
});
