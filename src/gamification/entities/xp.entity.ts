export const XP_PER_LEVEL = 200;

export const XP_RULES = {
  grammarCorrect: 5,
  vocabularyCorrect: 3,
  readingCompleted: 10,
  speakingSubmission: 10,
  writingSubmission: 15,
} as const;

export type XpActivity =
  | 'grammar_correct'
  | 'vocabulary_correct'
  | 'reading_completed'
  | 'speaking_submission'
  | 'writing_submission';

export interface XpStatus {
  xp: number;
  level: number;
  xpToNextLevel: number;
}

export function xpForActivity(activity: XpActivity): number {
  switch (activity) {
    case 'grammar_correct':
      return XP_RULES.grammarCorrect;
    case 'vocabulary_correct':
      return XP_RULES.vocabularyCorrect;
    case 'reading_completed':
      return XP_RULES.readingCompleted;
    case 'speaking_submission':
      return XP_RULES.speakingSubmission;
    case 'writing_submission':
      return XP_RULES.writingSubmission;
    default:
      return 0;
  }
}

export function computeLevel(xp: number): XpStatus {
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const xpIntoLevel = xp % XP_PER_LEVEL;
  return {
    xp,
    level,
    xpToNextLevel: XP_PER_LEVEL - xpIntoLevel,
  };
}
