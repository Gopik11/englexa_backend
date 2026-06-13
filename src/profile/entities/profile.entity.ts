export interface LearnerProfile {
  userId: string;
  xp: number;
  level: number;
  streak: number;
  last_active: Date | null;
  total_time_spent: number;
  lessons_completed: number;
  concepts_mastered: number;
  weak_areas: string[];
  strengths: string[];
  favorite_modules: string[];
  xp_to_next_level: number;
  email?: string;
}

export interface ProfileStatsUpdate {
  total_time_spent?: number;
  lessons_completed?: number;
  concepts_mastered?: number;
  weak_areas?: string[];
  strengths?: string[];
  favorite_modules?: string[];
}

export interface UpdateXpDto {
  amount?: number;
  source?: string;
  perfect_accuracy?: boolean;
}

export interface UpdateXpResult {
  xp: number;
  level: number;
  xp_earned: number;
  streak: number;
  xp_to_next_level: number;
  new_badges: string[];
  new_achievements: string[];
}
