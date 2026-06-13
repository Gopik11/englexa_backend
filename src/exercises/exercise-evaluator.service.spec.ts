import { ExerciseType } from '@prisma/client';
import { ExerciseEvaluatorService } from './exercise-evaluator.service';

describe('ExerciseEvaluatorService', () => {
  const evaluator = new ExerciseEvaluatorService();

  it('scores multiple choice correctly', () => {
    const result = evaluator.evaluate(
      {
        id: 'ex-1',
        lessonId: 'lesson-1',
        type: ExerciseType.MULTIPLE_CHOICE,
        prompt: 'Pick one',
        optionsJson: {
          choices: [
            { id: 'a', text: 'A' },
            { id: 'b', text: 'B' },
          ],
        },
        answerJson: { correctOptionId: 'b' },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      { selectedOptionId: 'b' },
    );

    expect(result.isCorrect).toBe(true);
    expect(result.score).toBe(100);
  });

  it('scores fill in the blank partially', () => {
    const result = evaluator.evaluate(
      {
        id: 'ex-2',
        lessonId: 'lesson-1',
        type: ExerciseType.FILL_IN_THE_BLANK,
        prompt: 'Fill',
        optionsJson: { template: 'I ___ happy.', blanks: 2 },
        answerJson: { answers: ['am', 'today'] },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      { answers: ['am', 'wrong'] },
    );

    expect(result.isCorrect).toBe(false);
    expect(result.score).toBe(50);
  });

  it('scores reorder sentence correctly', () => {
    const result = evaluator.evaluate(
      {
        id: 'ex-3',
        lessonId: 'lesson-1',
        type: ExerciseType.REORDER_SENTENCE,
        prompt: 'Reorder',
        optionsJson: { words: ['I', 'am', 'fine'] },
        answerJson: { order: ['I', 'am', 'fine'] },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      { order: ['I', 'am', 'fine'] },
    );

    expect(result.isCorrect).toBe(true);
  });
});
