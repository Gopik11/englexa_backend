import {
  clearGeneratedSpeakingCache,
  generateSpeakingPrompt,
  validateSpeakingPromptSchema,
} from './ai-speaking-prompt-generator';

describe('generateSpeakingPrompt', () => {
  beforeEach(() => {
    clearGeneratedSpeakingCache();
  });

  it('returns id, level, topic, prompt, and example_answer', () => {
    const result = generateSpeakingPrompt('beginner', 'self_introduction', {
      userId: 'user-a',
      sequence: 0,
    });

    expect(result).toMatchObject({
      id: expect.stringMatching(/^ai_beginner_self_introduction_/),
      level: 'beginner',
      topic: 'self_introduction',
      prompt: expect.any(String),
      example_answer: expect.any(String),
    });
    expect(() => validateSpeakingPromptSchema(result)).not.toThrow();
  });

  it('uses simple personal questions for beginner prompts', () => {
    const result = generateSpeakingPrompt('beginner', 'daily_routines', {
      userId: 'user-b',
      sequence: 0,
    });

    expect(result.prompt).toMatch(
      /what|where|who|how|introduce|morning|evening|weekend|usually|like/i,
    );
    expect(result.example_answer.split(' ').length).toBeLessThanOrEqual(20);
  });

  it('uses daily life or opinion prompts at intermediate level', () => {
    const daily = generateSpeakingPrompt('intermediate', 'travel_stories', {
      userId: 'user-c',
      sequence: 0,
    });
    const opinion = generateSpeakingPrompt('intermediate', 'opinions', {
      userId: 'user-c',
      sequence: 1,
    });

    expect(daily.prompt).toMatch(
      /describe|typical|relax|visited|travel|weekday|place/i,
    );
    expect(opinion.prompt).toMatch(
      /opinion|think|believe|prefer|better|should|public|homework|city/i,
    );
  });

  it('uses abstract or argumentative prompts at advanced level', () => {
    const presentation = generateSpeakingPrompt('advanced', 'presentations', {
      userId: 'user-d',
      sequence: 0,
    });
    const debate = generateSpeakingPrompt('advanced', 'debates', {
      userId: 'user-d',
      sequence: 1,
    });

    expect(presentation.prompt).toMatch(
      /presentation|technology|economic|growth|extent|abstract|teamwork/i,
    );
    expect(debate.prompt).toMatch(
      /argue|debate|whether|against|for or against|remote|universities|artificial intelligence/i,
    );
    expect(debate.example_answer).toMatch(/although|yet|however|because/i);
  });

  it('is deterministic for the same inputs', () => {
    const first = generateSpeakingPrompt('intermediate', 'opinions', {
      userId: 'user-e',
      sequence: 2,
    });
    const second = generateSpeakingPrompt('intermediate', 'opinions', {
      userId: 'user-e',
      sequence: 2,
    });

    expect(first).toEqual(second);
  });

  it('varies by sequence for the same user and topic', () => {
    const first = generateSpeakingPrompt('advanced', 'debates', {
      userId: 'user-f',
      sequence: 0,
    });
    const second = generateSpeakingPrompt('advanced', 'debates', {
      userId: 'user-f',
      sequence: 1,
    });

    expect(first.id).not.toBe(second.id);
  });
});
