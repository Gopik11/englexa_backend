import {
  GrammarConceptProgress,
  SkillConceptMastery,
  UserPracticeStats,
} from '@prisma/client';

export interface ModuleConceptRow {
  concept: string;
  masteryScore: number;
  mistakeCount: number;
  correctCount: number;
}

export function grammarAccuracy(rows: GrammarConceptProgress[]): number {
  const correct = rows.reduce((sum, row) => sum + row.correctCount, 0);
  const mistakes = rows.reduce((sum, row) => sum + row.mistakeCount, 0);
  const total = correct + mistakes;
  if (total === 0) {
    return 0;
  }
  return Math.round((correct / total) * 100);
}

export function conceptMasteryMap(
  rows: Array<{ concept: string; masteryScore: number }>,
): Record<string, number> {
  return rows.reduce<Record<string, number>>((acc, row) => {
    acc[row.concept] = row.masteryScore;
    return acc;
  }, {});
}

export function recentMistakeConcepts(
  rows: GrammarConceptProgress[],
  limit = 5,
): string[] {
  return [...rows]
    .filter((row) => row.mistakeCount > 0)
    .sort((a, b) => b.mistakeCount - a.mistakeCount)
    .slice(0, limit)
    .map((row) => row.concept);
}

export function vocabularyRetention(
  rows: SkillConceptMastery[],
  stats: UserPracticeStats | null,
): number {
  const vocabRows = rows.filter((row) => row.module === 'vocabulary');
  if (vocabRows.length > 0) {
    const avg =
      vocabRows.reduce((sum, row) => sum + row.masteryScore, 0) /
      vocabRows.length;
    return Math.round(avg);
  }
  const learned = stats?.vocabularyCorrect ?? 0;
  if (learned === 0) {
    return 0;
  }
  return Math.min(95, 60 + Math.floor(learned / 10));
}

export function weakConcepts(
  rows: SkillConceptMastery[],
  module: string,
  limit = 5,
): string[] {
  return rows
    .filter((row) => row.module === module)
    .sort((a, b) => a.masteryScore - b.masteryScore)
    .slice(0, limit)
    .map((row) => row.concept);
}

export function moduleAverageMastery(
  rows: SkillConceptMastery[],
  module: string,
  fallback = 0,
): number {
  const filtered = rows.filter((row) => row.module === module);
  if (filtered.length === 0) {
    return fallback;
  }
  return Math.round(
    filtered.reduce((sum, row) => sum + row.masteryScore, 0) /
      filtered.length,
  );
}
