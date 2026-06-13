import {
  clearGeneratedVocabCache,
  generateAIVocabExercise,
  validateVocabExerciseSchema,
} from './ai-vocab-generator';

describe('generateAIVocabExercise', () => {
  beforeEach(() => {
    clearGeneratedVocabCache();
  });

  it('returns one exercise matching the vocabulary JSON schema', () => {
    const exercise = generateAIVocabExercise('beginner', 'common_nouns', null, {
      userId: 'user-a',
      sequence: 0,
    });

    expect(exercise).toMatchObject({
      id: expect.stringMatching(/^ai_beginner_common_nouns_/),
      level: 'beginner',
      topic: 'common_nouns',
      type: expect.stringMatching(/^(mcq|fill_in|match)$/),
      question: expect.any(String),
      correct_answer: expect.any(String),
      explanation: expect.any(String),
      example_sentence: expect.any(String),
    });
    expect(() => validateVocabExerciseSchema(exercise)).not.toThrow();
  });

  it('is deterministic for the same inputs', () => {
    const first = generateAIVocabExercise('intermediate', 'phrasal_verbs', null, {
      userId: 'user-b',
      sequence: 2,
    });
    const second = generateAIVocabExercise('intermediate', 'phrasal_verbs', null, {
      userId: 'user-b',
      sequence: 2,
    });

    expect(first).toEqual(second);
  });

  it('varies by sequence for the same user and topic', () => {
    const first = generateAIVocabExercise('beginner', 'adjectives', null, {
      userId: 'user-c',
      sequence: 0,
    });
    const second = generateAIVocabExercise('beginner', 'adjectives', null, {
      userId: 'user-c',
      sequence: 1,
    });

    expect(first.id).not.toBe(second.id);
  });

  it('focuses on optionalWord with meaning, collocation, and usage', () => {
    const exercise = generateAIVocabExercise(
      'intermediate',
      'collocations',
      'interest',
      { userId: 'user-d', sequence: 0 },
    );

    expect(exercise.correct_answer).toBe('interest');
    expect(exercise.explanation.length).toBeGreaterThan(0);
    expect(exercise.explanation.length).toBeLessThan(280);
    expect(exercise.example_sentence).toContain('interest');
    expect(exercise.explanation.toLowerCase()).toMatch(/interest|natural|collocation|choice/);
  });

  it('uses seed profile data when optionalWord matches a blueprint', () => {
    const exercise = generateAIVocabExercise(
      'intermediate',
      'collocations',
      'interest',
      { userId: 'user-seed', sequence: 0 },
    );

    expect(exercise.example_sentence).toBe('He has a strong interest in science.');
    expect(exercise.explanation).toContain('interest');
  });

  it('keeps explanations short and spec-aligned', () => {
    const exercise = generateAIVocabExercise('advanced', 'idioms', 'bite the bullet', {
      userId: 'user-e',
      sequence: 0,
    });

    const sentences = exercise.explanation.split(/(?<=[.!?])\s+/);
    expect(sentences.length).toBeLessThanOrEqual(3);
    expect(exercise.explanation).not.toMatch(/great job|awesome|amazing/i);
  });

  it('generates different exercises for different optional words', () => {
    const first = generateAIVocabExercise('beginner', 'common_verbs', 'swim', {
      userId: 'user-f',
      sequence: 0,
    });
    const second = generateAIVocabExercise('beginner', 'common_verbs', 'read', {
      userId: 'user-f',
      sequence: 0,
    });

    expect(first.correct_answer).not.toBe(second.correct_answer);
    expect(first.explanation).not.toBe(second.explanation);
  });
});
