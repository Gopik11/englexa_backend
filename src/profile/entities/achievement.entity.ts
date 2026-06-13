export interface UserAchievement {
  userId: string;
  achievementId: string;
  name: string;
  description: string;
  earnedAt: Date | null;
  progress: number;
  goal: number;
}

export interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  goal: number;
}

export interface AchievementAwardContext {
  xp: number;
  lessonsCompleted: number;
  conceptsMastered: number;
  srsReviewCount: number;
}
