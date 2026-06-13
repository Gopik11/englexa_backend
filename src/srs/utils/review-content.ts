import { generateLesson } from '../../mini-lessons/utils/lesson-generator';
import { SrsReviewContent } from '../entities/srs.entity';

export function buildReviewContent(
  module: string,
  concept: string,
): SrsReviewContent {
  const lesson = generateLesson(concept, 2, module as never);
  const practice = lesson.quick_practice[0];

  return {
    title: lesson.title,
    example: lesson.examples[0] ?? `Practise ${concept.replace(/_/g, ' ')}.`,
    quick_practice: practice ?? {
      question: `Review: ${lesson.title}`,
      options: ['Option A', 'Option B', 'Option C'],
      answer: 'Option A',
    },
  };
}
