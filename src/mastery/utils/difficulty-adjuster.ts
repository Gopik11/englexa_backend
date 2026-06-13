import { LearnerLevel } from '../../content/englexa-content-spec.constants';

export function nextDifficulty(
  masteryScore: number,
  currentDifficulty: number,
): number {
  if (masteryScore >= 90) {
    return Math.min(5, currentDifficulty + 1);
  }
  if (masteryScore < 40) {
    return Math.max(1, currentDifficulty - 1);
  }
  return currentDifficulty;
}

export function effectiveLevelForDifficulty(
  baseLevel: LearnerLevel,
  difficulty: number,
): LearnerLevel {
  const order: LearnerLevel[] = ['beginner', 'intermediate', 'advanced'];
  const index = order.indexOf(baseLevel);
  const shift = difficulty >= 4 ? 1 : difficulty <= 2 ? -1 : 0;
  const next = Math.max(0, Math.min(order.length - 1, index + shift));
  return order[next];
}
