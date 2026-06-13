import {
  ERROR_PATTERN_THRESHOLD,
  generateChallenge,
  gradeChallengeAnswer,
  selectChallengeTarget,
} from './challenge-generator';

describe('challenge-generator', () => {
  const baseCtx = {
    userId: 'user-1',
    userLevel: 'beginner' as const,
    srsDue: null,
    topError: null,
    predictionDifficulty: 2,
    weakest: null,
  };

  it('prioritises SRS overdue concepts', () => {
    const target = selectChallengeTarget({
      ...baseCtx,
      srsDue: { module: 'grammar', concept: 'articles' },
      topError: { module: 'vocabulary', concept: 'synonyms', count: 10 },
    });

    expect(target.source).toBe('srs_review');
    expect(target.concept).toBe('articles');
  });

  it('uses weak-area challenge when error patterns are high', () => {
    const target = selectChallengeTarget({
      ...baseCtx,
      topError: { module: 'vocabulary', concept: 'collocations', count: ERROR_PATTERN_THRESHOLD },
    });

    expect(target.source).toBe('weak_area');
    expect(target.module).toBe('vocabulary');
  });

  it('generates a complete challenge payload', () => {
    const challenge = generateChallenge({
      ...baseCtx,
      srsDue: { module: 'grammar', concept: 'tenses' },
    });

    expect(challenge.type).toBe('grammar');
    expect(challenge.concept).toBe('tenses');
    expect(challenge.question).toBeTruthy();
    expect(challenge.source).toBe('srs_review');
  });

  it('grades multiple-choice answers', () => {
    const result = gradeChallengeAnswer(
      {
        type: 'grammar',
        concept: 'articles',
        difficulty: 2,
        question: 'Pick',
        options: ['a', 'an'],
        answer: 'an',
      },
      'an',
    );

    expect(result.correct).toBe(true);
    expect(result.score).toBe(100);
  });

  it('grades open responses leniently', () => {
    const result = gradeChallengeAnswer(
      {
        type: 'writing',
        concept: 'coherence',
        difficulty: 2,
        question: 'Write',
        prompt: 'Write about your hobby.',
        answer: 'hobby|enjoy',
      },
      'I enjoy playing guitar as my hobby.',
    );

    expect(result.correct).toBe(true);
    expect(result.score).toBe(100);
  });
});
