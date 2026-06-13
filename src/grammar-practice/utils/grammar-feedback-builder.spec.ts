import { buildGrammarFeedback } from './grammar-feedback-builder';

describe('grammar-feedback-builder', () => {
  it('includes what the learner wrote, rule, why, and example', () => {
    const feedback = buildGrammarFeedback({
      userAnswer: 'I have cat',
      correctAnswer: 'a',
      concept: 'Articles',
      exercise: {
        id: 'test',
        level: 'beginner',
        topic: 'articles',
        type: 'fill_blank',
        question: 'I have ___ cat.',
        options: null,
        correct_answer: 'a',
        explanation:
          'Use "a" before consonant sounds. Example: I have a dog too.',
      },
    });

    expect(feedback).toContain("You wrote: 'I have cat'");
    expect(feedback).toContain('Rule (Articles):');
    expect(feedback).toContain('Why:');
    expect(feedback).toContain('Example:');
  });
});
