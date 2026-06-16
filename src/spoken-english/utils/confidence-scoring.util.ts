export interface SpeakingConfidenceScores {
  grammarScore: number;
  pronunciationScore: number;
  fluencyScore: number;
  clarityScore: number;
  confidenceMarkers: number;
}

export function computeConfidenceScore(scores: SpeakingConfidenceScores): number {
  const weighted =
    scores.grammarScore * 0.25 +
    scores.pronunciationScore * 0.25 +
    scores.fluencyScore * 0.2 +
    scores.clarityScore * 0.15 +
    scores.confidenceMarkers * 0.15;

  return Math.round(weighted);
}
