import { generateLessonSummary } from './utils/summary-generator';

describe('summary-generator', () => {
  it('generates a structured lesson summary', () => {
    const result = generateLessonSummary({
      module: 'grammar',
      level: 'intermediate',
      sessionData: {
        topic: 'articles',
        correct_count: 4,
        total_count: 5,
        mistakes: ['articles'],
      },
      weakConcepts: ['articles'],
      recommendedConcept: 'prepositions',
    });

    expect(result.summary.split('.').length).toBeGreaterThanOrEqual(4);
    expect(result.key_points.length).toBeGreaterThan(0);
    expect(result.next_steps.length).toBeGreaterThan(0);
    expect(result.motivation.length).toBeGreaterThan(10);
  });
});
