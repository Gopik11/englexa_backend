import { MasteryBand } from '../entities/concept-mastery.entity';

export function computeMasteryScore(
  correctCount: number,
  mistakeCount: number,
): number {
  const total = correctCount + mistakeCount;
  if (total === 0) {
    return 0;
  }
  return Math.round((correctCount / total) * 100);
}

export function masteryBand(score: number): MasteryBand {
  if (score >= 90) return 'mastered';
  if (score >= 70) return 'strong';
  if (score >= 40) return 'developing';
  return 'weak';
}

export function compareWeakest(
  a: { masteryScore: number; mistakeCount: number },
  b: { masteryScore: number; mistakeCount: number },
): number {
  if (a.masteryScore !== b.masteryScore) {
    return a.masteryScore - b.masteryScore;
  }
  return b.mistakeCount - a.mistakeCount;
}

export function compareStrongest(
  a: { masteryScore: number; correctCount: number },
  b: { masteryScore: number; correctCount: number },
): number {
  if (a.masteryScore !== b.masteryScore) {
    return b.masteryScore - a.masteryScore;
  }
  return b.correctCount - a.correctCount;
}
