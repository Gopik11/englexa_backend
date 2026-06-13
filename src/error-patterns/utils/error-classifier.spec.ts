import { classifyError } from './error-classifier';

describe('error-classifier', () => {
  it('detects missing article in grammar', () => {
    const result = classifyError({
      userAnswer: 'I read book',
      correctAnswer: 'I read a book',
      module: 'grammar',
      topic: 'articles',
    });
    expect(result.error_type).toBe('missing_article');
  });

  it('detects wrong article in grammar', () => {
    const result = classifyError({
      userAnswer: 'a apple',
      correctAnswer: 'an apple',
      module: 'grammar',
      topic: 'articles',
    });
    expect(result.error_type).toBe('wrong_article');
  });

  it('detects vocabulary wrong word choice', () => {
    const result = classifyError({
      userAnswer: 'vehicle',
      correctAnswer: 'bicycle',
      module: 'vocabulary',
      topic: 'transport',
    });
    expect(result.error_type).toBe('wrong_word_choice');
  });

  it('detects writing punctuation issues', () => {
    const result = classifyError({
      userAnswer: 'Hello world',
      correctAnswer: 'Hello, world.',
      module: 'writing',
      concept: 'punctuation',
    });
    expect(result.error_type).toBe('punctuation_error');
  });
});
