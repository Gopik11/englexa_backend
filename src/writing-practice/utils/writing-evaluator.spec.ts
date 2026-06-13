import { TutorFeedbackService } from '../../ai/tutor-feedback.service';
import {
  clearWritingEvaluatorState,
  detectGrammarIssues,
  evaluateWriting,
} from './writing-evaluator';

describe('evaluateWriting', () => {
  const tutor = new TutorFeedbackService();

  beforeEach(() => {
    clearWritingEvaluatorState();
  });

  it('returns corrected text and all feedback fields', () => {
    const result = evaluateWriting(
      'beginner',
      'personal_paragraph',
      'my name is maria. i live in lisbon and i like reading books.',
      { userId: 'user-a' },
      tutor,
    );

    expect(result.correctedText).toMatch(/^My/);
    expect(result.grammarFeedback.length).toBeGreaterThan(0);
    expect(result.vocabularyFeedback).toMatch(/variety|vocabulary|precise/i);
    expect(result.coherenceFeedback.length).toBeGreaterThan(0);
    expect(result.structureFeedback.length).toBeGreaterThan(0);
    expect(result.encouragement!.length).toBeGreaterThan(0);
  });

  it('detects grammar issues with rule-based feedback', () => {
    const issues = detectGrammarIssues([
      'go to school every day',
      'I eat an banana yesterday',
    ]);

    expect(issues.some((item) => item.ruleKey === 'missing_subject')).toBe(true);
    expect(issues.some((item) => item.ruleKey === 'article')).toBe(true);

    const result = evaluateWriting(
      'beginner',
      'personal_paragraph',
      'go to school every day. I eat an banana yesterday.',
      {},
      tutor,
    );

    expect(result.grammarFeedback).toMatch(/grammar/i);
    expect(result.correctedText.toLowerCase()).toContain('i go');
  });

  it('comments on vocabulary variety and repetition', () => {
    const result = evaluateWriting(
      'intermediate',
      'opinion_paragraph',
      'I think city life is good. A city is good because good jobs are good for people.',
      { userId: 'user-b' },
      tutor,
    );

    expect(result.vocabularyFeedback).toMatch(/good|variety|repeated|precise/i);
  });

  it('evaluates coherence with linking words', () => {
    const weak = evaluateWriting(
      'intermediate',
      'opinion_paragraph',
      'City life is busy. Countryside is quiet.',
      {},
      tutor,
    );
    const strong = evaluateWriting(
      'intermediate',
      'opinion_paragraph',
      'City life is busy. However, the countryside is quieter because there is less traffic.',
      {},
      tutor,
    );

    expect(weak.coherenceFeedback).toMatch(/because|however|connect|link/i);
    expect(strong.coherenceFeedback).toMatch(/flow|link|because|however/i);
  });

  it('evaluates structure for advanced argumentative writing', () => {
    const result = evaluateWriting(
      'advanced',
      'argumentative_essay',
      'In my opinion, remote work improves productivity. Employees save commuting time and focus better. In conclusion, flexible policies benefit both staff and companies.',
      { userId: 'user-c' },
      tutor,
    );

    expect(result.structureFeedback).toMatch(/structure|opening|conclusion/i);
  });

  it('returns a micro-lesson focused on the main weakness after repeated low scores', () => {
    const text = 'go work. thing is good. thing is nice.';

    evaluateWriting('beginner', 'personal_paragraph', text, { userId: 'user-d' }, tutor);
    const second = evaluateWriting(
      'beginner',
      'personal_paragraph',
      text,
      { userId: 'user-d' },
      tutor,
    );

    expect(second.microLesson).not.toBeNull();
    expect(['grammar', 'vocabulary', 'coherence', 'structure']).toContain(
      second.microLesson?.focus,
    );
    expect(second.microLesson?.tip.length).toBeGreaterThan(10);
  });
});
