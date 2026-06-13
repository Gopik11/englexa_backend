export enum BadgeId {
  GRAMMAR_MASTER = 'GRAMMAR_MASTER',
  VOCABULARY_EXPLORER = 'VOCABULARY_EXPLORER',
  READING_CHAMPION = 'READING_CHAMPION',
  SPEAKING_STAR = 'SPEAKING_STAR',
  WRITING_PRO = 'WRITING_PRO',
  STREAK_7 = 'STREAK_7',
  STREAK_30 = 'STREAK_30',
  FIRST_LESSON = 'FIRST_LESSON',
  XP_500 = 'XP_500',
  MISSION_MASTER = 'MISSION_MASTER',
}

export interface BadgeDefinition {
  id: BadgeId;
  title: string;
  description: string;
}

export interface PracticeStatsSnapshot {
  grammarCorrect: number;
  vocabularyCorrect: number;
  readingCompleted: number;
  speakingSubmissions: number;
  writingSubmissions: number;
  streak: number;
  xp: number;
  completedLessons: number;
  missionCount: number;
}
