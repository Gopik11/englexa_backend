export interface GrammarConceptMastery {
  concept: string;
  correctCount: number;
  mistakeCount: number;
  masteryScore: number;
  xpEarned: number;
}

export interface GrammarProgressUpdate {
  xpAwarded: number;
  mastery: GrammarConceptMastery;
}
