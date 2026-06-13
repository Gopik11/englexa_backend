import { TutorFeedbackService } from './tutor-feedback.service';

describe('TutorFeedbackService', () => {
  let service: TutorFeedbackService;

  beforeEach(() => {
    service = new TutorFeedbackService();
  });

  it('returns spec JSON shape', () => {
    const result = service.generateTutorFeedback({
      userSentence: 'I want to gret now.',
      userId: 'user-1',
      level: 'intermediate',
    });

    expect(result).toEqual(
      expect.objectContaining({
        corrected_sentence: expect.any(String),
        grammar_feedback: expect.any(String),
        vocabulary_feedback: expect.any(String),
        encouragement: expect.any(String),
        next_step: expect.any(String),
        micro_lesson: null,
      }),
    );
  });

  it('follows spec §13 spelling example', () => {
    const result = service.generateTutorFeedback({
      userSentence: 'I want to gret now.',
      level: 'intermediate',
    });

    expect(result.corrected_sentence).toBe('I want to greet now.');
    expect(result.grammar_feedback).toContain('gret');
    expect(result.grammar_feedback).toContain('greet');
    expect(result.encouragement).toBe(
      'You\'re improving your structure. Let\'s refine it a bit more.',
    );
  });

  it('triggers micro-lesson after 3 article mistakes', () => {
    const userId = 'user-articles';

    service.generateTutorFeedback({
      userSentence: 'I want book.',
      userId,
      level: 'beginner',
    });
    service.generateTutorFeedback({
      userSentence: 'I need apple.',
      userId,
      level: 'beginner',
    });
    const third = service.generateTutorFeedback({
      userSentence: 'I want book.',
      userId,
      level: 'beginner',
    });

    expect(third.micro_lesson).toBe(
      'You often skip articles. Use "a" before consonant sounds and "an" before vowel sounds.',
    );
  });

  it('uses level-based encouragement templates', () => {
    const beginner = service.generateTutorFeedback({
      userSentence: 'I go to school.',
      level: 'beginner',
    });
    const advanced = service.generateTutorFeedback({
      userSentence: 'I go to school.',
      level: 'advanced',
    });

    expect(beginner.encouragement).toContain('learning quickly');
    expect(advanced.encouragement).toContain('sound more natural');
  });
});
