export type RecommendedAction = 'review' | 'boost' | 'practice' | 'mini_lesson';

export interface ConceptPrediction {
  userId: string;
  module: string;
  concept: string;
  predicted_difficulty: number;
  probability_correct: number;
  needs_review: boolean;
  needs_mini_lesson: boolean;
  recommended_action: RecommendedAction;
  timestamp: Date;
}

export interface PredictionRecommendations {
  userId: string;
  predictions: ConceptPrediction[];
  generated_at: Date;
}
