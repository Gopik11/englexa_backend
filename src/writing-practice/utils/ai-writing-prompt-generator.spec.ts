import {
  clearGeneratedWritingCache,
  generateWritingPrompt,
  validateWritingPromptSchema,
} from './ai-writing-prompt-generator';

describe('generateWritingPrompt', () => {
  beforeEach(() => {
    clearGeneratedWritingCache();
  });

  it('returns id, level, topic, prompt, word_limit, and example_outline', () => {
    const result = generateWritingPrompt('beginner', 'personal_paragraph', {
      userId: 'user-a',
      sequence: 0,
    });

    expect(result).toMatchObject({
      id: expect.stringMatching(/^ai_beginner_personal_paragraph_/),
      level: 'beginner',
      topic: 'personal_paragraph',
      prompt: expect.any(String),
      word_limit: expect.any(Number),
      example_outline: expect.any(Array),
    });
    expect(result.example_outline.length).toBeGreaterThanOrEqual(3);
    expect(() => validateWritingPromptSchema(result)).not.toThrow();
  });

  it('uses short 5–6 sentence paragraph tasks for beginner', () => {
    const result = generateWritingPrompt('beginner', 'personal_paragraph', {
      userId: 'user-b',
      sequence: 0,
    });

    expect(result.prompt).toMatch(/5.?6 sentences|short paragraph/i);
    expect(result.example_outline.length).toBeGreaterThanOrEqual(5);
    expect(result.word_limit).toBeLessThanOrEqual(90);
  });

  it('uses opinion paragraph tasks at intermediate level', () => {
    const result = generateWritingPrompt('intermediate', 'opinion_paragraph', {
      userId: 'user-c',
      sequence: 0,
    });

    expect(result.prompt).toMatch(/opinion|whether|view|recommend|effective/i);
    expect(result.example_outline.some((step) => /opinion|reason|conclusion/i.test(step))).toBe(
      true,
    );
  });

  it('uses argumentative or problem-solution tasks at advanced level', () => {
    const argument = generateWritingPrompt('advanced', 'argumentative_essay', {
      userId: 'user-d',
      sequence: 0,
    });
    const problemSolution = generateWritingPrompt('advanced', 'formal_summary', {
      userId: 'user-d',
      sequence: 1,
    });

    expect(argument.prompt).toMatch(/argue|argument|position|counterargument/i);
    expect(problemSolution.prompt).toMatch(/problem-solution|problem|solution|recommend/i);
    expect(argument.example_outline).toContain('Thesis statement');
    expect(problemSolution.example_outline).toContain('Recommended solution');
  });

  it('is deterministic for the same inputs', () => {
    const first = generateWritingPrompt('intermediate', 'opinion_paragraph', {
      userId: 'user-e',
      sequence: 2,
    });
    const second = generateWritingPrompt('intermediate', 'opinion_paragraph', {
      userId: 'user-e',
      sequence: 2,
    });

    expect(first).toEqual(second);
  });

  it('varies by sequence for the same user and topic', () => {
    const first = generateWritingPrompt('advanced', 'argumentative_essay', {
      userId: 'user-f',
      sequence: 0,
    });
    const second = generateWritingPrompt('advanced', 'argumentative_essay', {
      userId: 'user-f',
      sequence: 1,
    });

    expect(first.id).not.toBe(second.id);
  });
});
