export type MasteryModule =
  | 'grammar'
  | 'vocabulary'
  | 'reading'
  | 'speaking'
  | 'writing';

export type MasteryBand = 'weak' | 'developing' | 'strong' | 'mastered';

export interface ConceptMastery {
  module: MasteryModule;
  concept: string;
  correctCount: number;
  mistakeCount: number;
  masteryScore: number;
  band: MasteryBand;
  timeSpentMs: number;
  difficulty: number;
}

export interface MasteryOverview {
  concepts: ConceptMastery[];
  weakest: ConceptMastery[];
  strongest: ConceptMastery[];
}

export interface MasteryRecommendation {
  recommended_module: MasteryModule;
  recommended_concept: string;
  reason: string;
  next_exercise: Record<string, unknown>;
}
