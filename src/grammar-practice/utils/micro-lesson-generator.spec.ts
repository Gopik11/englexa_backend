import {
  formatMicroLessonForResponse,
  generateMicroLesson,
  validateMicroLessonStructure,
} from './micro-lesson-generator';
import { MICRO_LESSONS } from '../../content/englexa-content-spec.constants';

const CORE_CONCEPTS = [
  'Articles',
  'Subject-Verb Agreement',
  'Simple Present',
  'Past Tense',
  'Prepositions',
  'Modals',
  'Perfect Tenses',
] as const;

describe('micro-lesson-generator', () => {
  it('generates a structured Articles lesson from spec text', () => {
    const lesson = generateMicroLesson('Articles');

    expect(lesson.title).toContain('a');
    expect(lesson.explanation).toContain(MICRO_LESSONS.article.text);
    expect(lesson.examples).toEqual([
      'I read a book every day.',
      'She ate an apple for lunch.',
    ]);
    expect(lesson.practice).toHaveLength(2);
    expect(validateMicroLessonStructure(lesson)).toBe(true);
  });

  it('uses spec preposition and past tense rules', () => {
    const prepositions = generateMicroLesson('Prepositions');
    const pastTense = generateMicroLesson('Past Tense');

    expect(prepositions.explanation).toContain(MICRO_LESSONS.preposition.text);
    expect(pastTense.explanation).toContain(MICRO_LESSONS.verb_tense.text);
    expect(validateMicroLessonStructure(prepositions)).toBe(true);
    expect(validateMicroLessonStructure(pastTense)).toBe(true);
  });

  it('keeps 2 examples and 1–2 practice tasks for core concepts', () => {
    for (const concept of CORE_CONCEPTS) {
      const lesson = generateMicroLesson(concept);

      expect(lesson.examples).toHaveLength(2);
      expect(lesson.practice.length).toBeGreaterThanOrEqual(1);
      expect(lesson.practice.length).toBeLessThanOrEqual(2);
      expect(validateMicroLessonStructure(lesson)).toBe(true);
    }
  });

  it('formats lessons for API responses', () => {
    const formatted = formatMicroLessonForResponse(generateMicroLesson('Articles'));

    expect(formatted).toContain('Examples:');
    expect(formatted).toContain('Practice:');
    expect(formatted).toContain('I read a book every day.');
  });

  it('falls back for unknown concepts', () => {
    const lesson = generateMicroLesson('Unknown Concept');

    expect(lesson.title).toBe('Unknown Concept');
    expect(validateMicroLessonStructure(lesson)).toBe(true);
  });
});
