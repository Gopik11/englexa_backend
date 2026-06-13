export interface UserBadge {
  userId: string;
  badgeId: string;
  name: string;
  description: string;
  earnedAt: Date;
}

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
}

export interface BadgeAwardContext {
  xp: number;
  streak: number;
  lessonsCompleted: number;
  conceptsMastered: number;
  srsReviewCount: number;
  moduleMastery: Record<string, number>;
  speakingSubmissions: number;
  dailyChallengesCompleted: number;
}
