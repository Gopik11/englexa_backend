import {
  computeStreakUpdate,
  effectiveStreak,
  streakAfterActivity,
} from './streak-manager';

describe('streak-manager', () => {
  const now = new Date('2026-06-09T12:00:00.000Z');

  it('increments streak when last active was yesterday', () => {
    const yesterday = new Date('2026-06-08T10:00:00.000Z');
    expect(computeStreakUpdate(4, yesterday, now)).toBe(5);
  });

  it('resets streak when gap is greater than one day', () => {
    const threeDaysAgo = new Date('2026-06-06T10:00:00.000Z');
    expect(computeStreakUpdate(10, threeDaysAgo, now)).toBe(0);
    expect(streakAfterActivity(10, threeDaysAgo, now)).toBe(1);
  });

  it('shows zero effective streak after missed day', () => {
    const threeDaysAgo = new Date('2026-06-06T10:00:00.000Z');
    expect(effectiveStreak(10, threeDaysAgo, now)).toBe(0);
  });
});
