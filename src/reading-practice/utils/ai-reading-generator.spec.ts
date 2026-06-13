import {
  clearGeneratedReadingCache,
  generateAIReadingPassage,
  validateReadingPassageSchema,
} from './ai-reading-generator';

describe('generateAIReadingPassage', () => {
  beforeEach(() => {
    clearGeneratedReadingCache();
  });

  it('returns a passage with title, text, and 3–5 questions', () => {
    const passage = generateAIReadingPassage('beginner', 'short_dialogues', {
      userId: 'user-a',
      sequence: 0,
    });

    expect(passage.title.length).toBeGreaterThan(0);
    expect(passage.passage.length).toBeGreaterThan(50);
    expect(passage.questions.length).toBeGreaterThanOrEqual(3);
    expect(passage.questions.length).toBeLessThanOrEqual(5);
    expect(() => validateReadingPassageSchema(passage)).not.toThrow();
  });

  it('is deterministic for the same inputs', () => {
    const first = generateAIReadingPassage('intermediate', 'news_snippets', {
      userId: 'user-b',
      sequence: 1,
    });
    const second = generateAIReadingPassage('intermediate', 'news_snippets', {
      userId: 'user-b',
      sequence: 1,
    });

    expect(first).toEqual(second);
  });

  it('varies by sequence for the same user and topic', () => {
    const first = generateAIReadingPassage('advanced', 'essays', {
      userId: 'user-c',
      sequence: 0,
    });
    const second = generateAIReadingPassage('advanced', 'essays', {
      userId: 'user-c',
      sequence: 1,
    });

    expect(first.id).not.toBe(second.id);
  });

  it('uses level-appropriate vocabulary in advanced passages', () => {
    const passage = generateAIReadingPassage('advanced', 'argumentative_texts', {
      userId: 'user-d',
      sequence: 0,
    });

    expect(passage.passage.toLowerCase()).toMatch(/policy|housing|rent|rules/);
    expect(passage.questions.every((q) => q.explanation.length > 20)).toBe(true);
  });

  it('explains why each answer is correct with passage support', () => {
    const passage = generateAIReadingPassage('beginner', 'short_dialogues', {
      userId: 'user-e',
      sequence: 0,
    });

    for (const question of passage.questions) {
      expect(question.explanation.length).toBeGreaterThan(20);
      expect(question.explanation).toMatch(
        /because|so|which explains|that is|the passage|the text|the story|the author|the writer|says|states|tells|writes|argues|proposes|suggests/i,
      );
    }
  });

  it('includes mcq options only for mcq questions', () => {
    const passage = generateAIReadingPassage('intermediate', 'opinion_paragraphs', {
      userId: 'user-f',
      sequence: 0,
    });

    for (const question of passage.questions) {
      if (question.type === 'mcq') {
        expect(question.options?.length).toBeGreaterThanOrEqual(2);
      } else {
        expect(question.options).toBeNull();
      }
    }
  });
});
