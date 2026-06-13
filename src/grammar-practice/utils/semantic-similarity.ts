/** Default threshold — answers above this score are treated as correct. */
export const SEMANTIC_SIMILARITY_THRESHOLD = 0.8;

/**
 * Normalizes learner/correct answers for comparison:
 * trim, lowercase, collapse spaces, strip trailing punctuation,
 * and collapse accidental double periods.
 */
export function normalizeAnswer(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\.{2,}/g, '.')
    .replace(/[.!?,;:'"]+$/g, '')
    .replace(/\s+/g, ' ');
}

function tokenize(value: string): string[] {
  return normalizeAnswer(value)
    .split(' ')
    .filter((token) => token.length > 0);
}

function countTokens(tokens: string[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const token of tokens) {
    counts.set(token, (counts.get(token) ?? 0) + 1);
  }
  return counts;
}

/**
 * Token-frequency cosine similarity in [0, 1].
 * Identical normalized answers score 1.0.
 */
export function semanticSimilarity(a: string, b: string): number {
  const tokensA = tokenize(a);
  const tokensB = tokenize(b);

  if (tokensA.length === 0 && tokensB.length === 0) {
    return 1;
  }

  if (tokensA.length === 0 || tokensB.length === 0) {
    return 0;
  }

  const freqA = countTokens(tokensA);
  const freqB = countTokens(tokensB);
  const allTokens = new Set([...freqA.keys(), ...freqB.keys()]);

  let dot = 0;
  let magA = 0;
  let magB = 0;

  for (const token of allTokens) {
    const aCount = freqA.get(token) ?? 0;
    const bCount = freqB.get(token) ?? 0;
    dot += aCount * bCount;
    magA += aCount * aCount;
    magB += bCount * bCount;
  }

  if (magA === 0 || magB === 0) {
    return 0;
  }

  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

/** Returns true when normalized strings match or cosine similarity exceeds the threshold. */
export function isSemanticallySimilar(
  a: string,
  b: string,
  threshold: number = SEMANTIC_SIMILARITY_THRESHOLD,
): boolean {
  const normalizedA = normalizeAnswer(a);
  const normalizedB = normalizeAnswer(b);

  if (normalizedA === normalizedB) {
    return true;
  }

  return semanticSimilarity(normalizedA, normalizedB) > threshold;
}
