export interface HomeGamificationSummary {
  xp: number;
  level: number;
  streak: number;
  xp_to_next_level: number;
}

export interface ShapedDailyChallenge {
  completed: boolean;
  score?: number;
  type: string;
  concept: string;
  difficulty: number;
  question: string;
  prompt?: string;
}

export interface ShapedMiniLesson {
  id: string;
  concept: string;
  module: string;
  title: string;
  difficulty_level: number;
  estimated_time: number;
}

export interface ShapedPrediction {
  module: string;
  concept: string;
  predicted_difficulty: number;
  probability_correct: number;
  recommended_action: string;
}

export interface ShapedSrsDueItem {
  module: string;
  concept: string;
  title: string;
}

export interface HomeDataResponse {
  word_of_the_day: {
    word: string;
    definition: string;
    example: string;
  };
  daily_challenge: ShapedDailyChallenge | null;
  mini_lesson: ShapedMiniLesson | null;
  srs_due: ShapedSrsDueItem[];
  predictions: ShapedPrediction[];
  gamification: HomeGamificationSummary;
}

export function emptyHomeData(): HomeDataResponse {
  return {
    word_of_the_day: { word: '', definition: '', example: '' },
    daily_challenge: null,
    mini_lesson: null,
    srs_due: [],
    predictions: [],
    gamification: {
      xp: 0,
      level: 1,
      streak: 0,
      xp_to_next_level: 200,
    },
  };
}
