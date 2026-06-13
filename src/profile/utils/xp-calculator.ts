export const XP_PER_LEVEL = 200;

export type ProfileXpSource =
  | 'lesson'
  | 'daily_challenge'
  | 'speaking'
  | 'mini_lesson'
  | 'srs_review'
  | 'perfect_accuracy'
  | 'custom';

const BASE_XP: Record<Exclude<ProfileXpSource, 'custom' | 'perfect_accuracy'>, number> = {
  lesson: 20,
  daily_challenge: 30,
  speaking: 40,
  mini_lesson: 10,
  srs_review: 15,
};

export function baseXpForSource(source: ProfileXpSource): number {
  if (source === 'perfect_accuracy' || source === 'custom') {
    return 0;
  }
  return BASE_XP[source] ?? 0;
}

export function streakBonusXp(streak: number): number {
  return Math.max(0, streak) * 5;
}

export function perfectAccuracyBonus(): number {
  return 10;
}

export function calculateXpAward(options: {
  source: ProfileXpSource;
  streak: number;
  perfectAccuracy?: boolean;
  customAmount?: number;
}): number {
  const base =
    options.source === 'custom'
      ? Math.max(0, options.customAmount ?? 0)
      : baseXpForSource(options.source);

  const bonus = streakBonusXp(options.streak);
  const perfect = options.perfectAccuracy ? perfectAccuracyBonus() : 0;

  return base + bonus + perfect;
}

export function computeLevel(xp: number): {
  level: number;
  xp_to_next_level: number;
} {
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const xpIntoLevel = xp % XP_PER_LEVEL;
  return {
    level,
    xp_to_next_level: XP_PER_LEVEL - xpIntoLevel,
  };
}
