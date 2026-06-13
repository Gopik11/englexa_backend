import { LearnerLevel } from '../../content/englexa-content-spec.constants';
import { CROSSWORDS_BY_LEVEL } from '../../content/home-daily.constants';
import { pickDailyIndex } from './daily-seed';

export interface MiniCrossword {
  grid: string[][];
  clues: {
    across: Record<string, string>;
    down: Record<string, string>;
  };
}

export function generateMiniCrossword(
  userLevel: LearnerLevel,
  userId: string,
): MiniCrossword {
  const pool = CROSSWORDS_BY_LEVEL[userLevel];
  const index = pickDailyIndex(userId, 'crossword', pool.length);
  const template = pool[index]!;

  return {
    grid: template.grid.map((row) => [...row]),
    clues: {
      across: { ...template.clues.across },
      down: { ...template.clues.down },
    },
  };
}
