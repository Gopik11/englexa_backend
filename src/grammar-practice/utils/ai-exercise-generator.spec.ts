import {
  clearGeneratedExerciseCache,
  generateAIExercise,
  validateGrammarExerciseSchema,
} from './ai-exercise-generator';
import { GrammarTopic } from '../interfaces/grammar-exercise.interface';

describe('generateAIExercise', () => {
  beforeEach(() => {
    clearGeneratedExerciseCache();
  });

  it('returns one exercise matching the JSON schema', () => {
    const exercise = generateAIExercise('beginner', 'articles', {
      userId: 'user-a',
      sequence: 0,
    });

    expect(exercise).toMatchObject({
      id: expect.stringMatching(/^ai_beginner_articles_/),
      level: 'beginner',
      topic: 'articles',
      type: expect.any(String),
      question: expect.any(String),
      options: null,
      correct_answer: expect.any(String),
      explanation: expect.any(String),
    });
    expect(exercise.explanation).toContain('Example:');
    expect(() => validateGrammarExerciseSchema(exercise)).not.toThrow();
  });

  it('is deterministic for the same inputs', () => {
    const context = { userId: 'user-b', sequence: 2 };
    const first = generateAIExercise('intermediate', 'modals', context);
    const second = generateAIExercise('intermediate', 'modals', context);

    expect(first).toEqual(second);
  });

  it('varies by sequence for the same user and topic', () => {
    const userId = 'user-c';
    const first = generateAIExercise('beginner', 'prepositions', {
      userId,
      sequence: 0,
    });
    const second = generateAIExercise('beginner', 'prepositions', {
      userId,
      sequence: 1,
    });

    expect(first.id).not.toBe(second.id);
  });

  it('builds explanations from spec constants, not inline text', () => {
    const exercise = generateAIExercise('beginner', 'simple_past', {
      userId: 'user-d',
      sequence: 0,
    });

    expect(exercise.explanation).toContain('Regular verbs form the past tense');
    expect(exercise.explanation).toContain('Example:');
  });

  it('targets a concept when the concept parameter is provided', () => {
    const exercise = generateAIExercise('beginner', 'prepositions', {
      userId: 'user-concept',
      sequence: 0,
      concept: 'Articles',
    });

    expect(exercise.explanation).toMatch(/^Articles:/);
    expect(exercise.explanation).toContain('article');
    expect(exercise.correct_answer).toBeTruthy();
  });

  it('prefers concept-aligned blueprints within the current topic pool', () => {
    const withoutConcept = generateAIExercise('beginner', 'simple_present', {
      userId: 'user-sp',
      sequence: 0,
    });
    const withConcept = generateAIExercise('beginner', 'simple_present', {
      userId: 'user-sp',
      sequence: 0,
      concept: 'Simple Present',
    });

    expect(withConcept.explanation).toMatch(/^Simple Present:/);
    expect(withConcept.explanation).toContain('Example:');
    expect(withoutConcept.type).toEqual(expect.any(String));
  });

  it('supports legacy targetConcept context field', () => {
    const exercise = generateAIExercise('beginner', 'articles', {
      userId: 'legacy-user',
      sequence: 1,
      targetConcept: 'Articles',
    });

    expect(exercise.explanation).toMatch(/^Articles:/);
  });

  it('sets options to null for non-MCQ types and arrays for MCQ', () => {
    for (let sequence = 0; sequence < 6; sequence += 1) {
      const exercise = generateAIExercise('beginner', 'articles', {
        userId: 'schema-user',
        sequence,
      });

      if (exercise.type === 'mcq') {
        expect(exercise.options?.length).toBeGreaterThanOrEqual(2);
      } else {
        expect(exercise.options).toBeNull();
      }
    }
  });

  it('covers all grammar topics at each level', () => {
    const topics: GrammarTopic[] = [
      'articles',
      'simple_present',
      'simple_past',
      'prepositions',
      'subject_verb',
      'basic_structure',
      'present_vs_continuous',
      'past_vs_continuous',
      'countable_uncountable',
      'comparatives',
      'modals',
      'adverbs',
      'conditionals',
      'relative_clauses',
      'passive_voice',
      'reported_speech',
      'perfect_tenses',
      'connectors',
    ];

    for (const topic of topics) {
      const beginner = generateAIExercise('beginner', topic, {
        userId: 'coverage',
        sequence: 0,
      });
      expect(beginner.topic).toBe(topic);
      expect(beginner.explanation.length).toBeGreaterThan(0);
      validateGrammarExerciseSchema(beginner);
    }
  });
});
