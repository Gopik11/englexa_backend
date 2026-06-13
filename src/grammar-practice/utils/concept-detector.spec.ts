import { identifyConcept } from './concept-detector';

describe('concept-detector', () => {
  describe('identifyConcept', () => {
    it('returns topic default for unhandled topics', () => {
      expect(identifyConcept('modals', 'must to go', 'must go')).toBe('Modals');
    });

    it('detects missing or wrong articles', () => {
      expect(identifyConcept('articles', 'cat', 'a cat')).toBe('Articles');
      expect(identifyConcept('articles', 'a apple', 'an apple')).toBe('Articles');
      expect(identifyConcept('articles', 'the', 'a')).toBe('Articles');
    });

    it('detects subject-verb agreement issues', () => {
      expect(
        identifyConcept('subject_verb', 'He play soccer', 'He plays soccer'),
      ).toBe('Subject-Verb Agreement');
      expect(
        identifyConcept('subject_verb', 'They plays soccer', 'They play soccer'),
      ).toBe('Subject-Verb Agreement');
    });

    it('detects simple present verb form errors', () => {
      expect(
        identifyConcept('simple_present', 'He play soccer', 'He plays soccer'),
      ).toBe('Simple Present');
      expect(
        identifyConcept('simple_present', 'She go to work', 'She goes to work'),
      ).toBe('Simple Present');
    });

    it('detects incorrect prepositions', () => {
      expect(
        identifyConcept('prepositions', 'in Monday', 'on Monday'),
      ).toBe('Prepositions');
      expect(
        identifyConcept('prepositions', 'at London', 'in London'),
      ).toBe('Prepositions');
    });

    it('detects wrong past tense forms', () => {
      expect(
        identifyConcept('simple_past', 'I walk home', 'I walked home'),
      ).toBe('Past Tense');
      expect(
        identifyConcept('simple_past', 'She go yesterday', 'She went yesterday'),
      ).toBe('Past Tense');
    });
  });
});
