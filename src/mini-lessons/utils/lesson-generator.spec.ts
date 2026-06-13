import {
  generateLesson,
  getConceptsForModule,
  normalizeConcept,
} from './lesson-generator';

describe('lesson-generator', () => {
  it('normalizes concept aliases', () => {
    expect(normalizeConcept('present_simple')).toBe('tenses');
    expect(normalizeConcept('article')).toBe('articles');
  });

  it('generates a complete grammar lesson', () => {
    const lesson = generateLesson('articles', 2);

    expect(lesson.id).toBe('grammar:articles');
    expect(lesson.module).toBe('grammar');
    expect(lesson.title).toBeTruthy();
    expect(lesson.explanation).toBeTruthy();
    expect(lesson.examples.length).toBeGreaterThan(0);
    expect(lesson.common_mistakes.length).toBeGreaterThan(0);
    expect(lesson.quick_practice[0]?.options.length).toBeGreaterThan(0);
    expect(lesson.estimated_time).toBeGreaterThan(0);
  });

  it('scales difficulty with more practice at higher levels', () => {
    const easy = generateLesson('modals', 1);
    const hard = generateLesson('modals', 5);

    expect(hard.quick_practice.length).toBeGreaterThanOrEqual(
      easy.quick_practice.length,
    );
    expect(hard.estimated_time).toBeGreaterThanOrEqual(easy.estimated_time);
  });

  it('lists concepts per module', () => {
    expect(getConceptsForModule('vocabulary')).toContain('idioms');
    expect(getConceptsForModule('speaking')).toContain('fluency_tips');
  });
});
