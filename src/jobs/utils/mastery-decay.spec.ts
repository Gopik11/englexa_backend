import { decayMasteryScore, daysSince } from './mastery-decay';

describe('mastery-decay', () => {
  it('does not decay recently active concepts', () => {
    expect(decayMasteryScore(80, 5)).toBe(80);
  });

  it('decays inactive concepts', () => {
    expect(decayMasteryScore(80, 30)).toBeLessThan(80);
    expect(decayMasteryScore(80, 30)).toBeGreaterThanOrEqual(0);
  });

  it('computes days since a date', () => {
    const now = new Date('2026-06-10T00:00:00.000Z');
    const past = new Date('2026-06-01T00:00:00.000Z');
    expect(daysSince(past, now)).toBe(9);
  });
});
