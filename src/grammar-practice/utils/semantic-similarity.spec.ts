import {
  isSemanticallySimilar,
  normalizeAnswer,
  semanticSimilarity,
  SEMANTIC_SIMILARITY_THRESHOLD,
} from './semantic-similarity';

describe('semantic-similarity', () => {
  describe('normalizeAnswer', () => {
    it('trims, lowercases, collapses spaces, and strips trailing punctuation', () => {
      expect(normalizeAnswer('  A Cat.  ')).toBe('a cat');
      expect(normalizeAnswer('hello   world!')).toBe('hello world');
    });

    it('collapses accidental double periods', () => {
      expect(normalizeAnswer('I have a cat..')).toBe('i have a cat');
      expect(normalizeAnswer('Wait.. what')).toBe('wait. what');
    });
  });

  describe('semanticSimilarity', () => {
    it('returns 1 for identical normalized answers', () => {
      expect(semanticSimilarity('I have a cat.', 'I have a cat')).toBe(1);
    });

    it('returns high similarity for near matches', () => {
      const score = semanticSimilarity(
        'I have a cat',
        'I have a cat at home',
      );
      expect(score).toBeGreaterThan(SEMANTIC_SIMILARITY_THRESHOLD);
    });

    it('returns low similarity for unrelated answers', () => {
      expect(semanticSimilarity('a cat', 'the dog')).toBeLessThan(0.5);
    });
  });

  describe('isSemanticallySimilar', () => {
    it('treats exact normalized matches as similar', () => {
      expect(isSemanticallySimilar('walked.', 'walked')).toBe(true);
    });

    it('uses the 0.80 threshold', () => {
      expect(SEMANTIC_SIMILARITY_THRESHOLD).toBe(0.8);
    });
  });
});
