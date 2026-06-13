import { Injectable } from '@nestjs/common';
import { Exercise, ExerciseType } from '@prisma/client';
import {
  ExerciseEvaluationResult,
  FillInBlankAnswer,
  FillInBlankOptions,
  MultipleChoiceAnswer,
  MultipleChoiceOptions,
  PictureWordMatchAnswer,
  PictureWordMatchOptions,
  ReorderSentenceAnswer,
  ReorderSentenceOptions,
} from '../common/types/exercise-content.types';

@Injectable()
export class ExerciseEvaluatorService {
  evaluate(
    exercise: Exercise,
    userAnswer: unknown,
  ): ExerciseEvaluationResult {
    switch (exercise.type) {
      case ExerciseType.MULTIPLE_CHOICE:
        return this.evaluateMultipleChoice(exercise.id, exercise, userAnswer);
      case ExerciseType.FILL_IN_THE_BLANK:
        return this.evaluateFillInBlank(exercise.id, exercise, userAnswer);
      case ExerciseType.REORDER_SENTENCE:
        return this.evaluateReorder(exercise.id, exercise, userAnswer);
      case ExerciseType.PICTURE_WORD_MATCH:
        return this.evaluatePictureMatch(exercise.id, exercise, userAnswer);
      default:
        return {
          exerciseId: exercise.id,
          isCorrect: false,
          score: 0,
          feedback: 'Unsupported exercise type',
        };
    }
  }

  private evaluateMultipleChoice(
    exerciseId: string,
    exercise: Exercise,
    userAnswer: unknown,
  ): ExerciseEvaluationResult {
    const options = exercise.optionsJson as unknown as MultipleChoiceOptions;
    const expected = exercise.answerJson as unknown as MultipleChoiceAnswer;
    const answer =
      typeof userAnswer === 'object' && userAnswer !== null
        ? (userAnswer as { selectedOptionId?: string }).selectedOptionId
        : undefined;

    const isCorrect = answer === expected.correctOptionId;
    const choiceLabel =
      options.choices.find((choice) => choice.id === answer)?.text ?? answer;

    return {
      exerciseId,
      isCorrect,
      score: isCorrect ? 100 : 0,
      feedback: isCorrect
        ? 'Correct!'
        : `Incorrect. You chose "${choiceLabel ?? 'nothing'}".`,
    };
  }

  private evaluateFillInBlank(
    exerciseId: string,
    exercise: Exercise,
    userAnswer: unknown,
  ): ExerciseEvaluationResult {
    const expected = exercise.answerJson as unknown as FillInBlankAnswer;
    const options = exercise.optionsJson as unknown as FillInBlankOptions;
    const submitted =
      typeof userAnswer === 'object' && userAnswer !== null
        ? ((userAnswer as { answers?: string[] }).answers ?? [])
        : [];

    const normalizedExpected = expected.answers.map((value) =>
      this.normalize(value),
    );
    const normalizedSubmitted = submitted.map((value) => this.normalize(value));

    let correctCount = 0;
    for (let index = 0; index < options.blanks; index += 1) {
      if (normalizedSubmitted[index] === normalizedExpected[index]) {
        correctCount += 1;
      }
    }

    const isCorrect = correctCount === options.blanks;
    const score = Math.round((correctCount / options.blanks) * 100);

    return {
      exerciseId,
      isCorrect,
      score,
      feedback: isCorrect
        ? 'All blanks are correct!'
        : `${correctCount}/${options.blanks} blanks correct.`,
    };
  }

  private evaluateReorder(
    exerciseId: string,
    exercise: Exercise,
    userAnswer: unknown,
  ): ExerciseEvaluationResult {
    const expected = exercise.answerJson as unknown as ReorderSentenceAnswer;
    const options = exercise.optionsJson as unknown as ReorderSentenceOptions;
    const submitted =
      typeof userAnswer === 'object' && userAnswer !== null
        ? ((userAnswer as { order?: string[] }).order ?? [])
        : [];

    const isCorrect =
      submitted.length === expected.order.length &&
      submitted.every(
        (word, index) =>
          this.normalize(word) === this.normalize(expected.order[index]),
      );

    return {
      exerciseId,
      isCorrect,
      score: isCorrect ? 100 : 0,
      feedback: isCorrect
        ? 'Perfect sentence order!'
        : `Try arranging: ${options.words.join(', ')}`,
    };
  }

  private evaluatePictureMatch(
    exerciseId: string,
    exercise: Exercise,
    userAnswer: unknown,
  ): ExerciseEvaluationResult {
    const expected = exercise.answerJson as unknown as PictureWordMatchAnswer;
    const submitted =
      typeof userAnswer === 'object' && userAnswer !== null
        ? ((userAnswer as { pairs?: PictureWordMatchAnswer['pairs'] }).pairs ??
          [])
        : [];

    let correctCount = 0;
    for (const pair of expected.pairs) {
      const match = submitted.find((item) => item.imageId === pair.imageId);
      if (match && this.normalize(match.word) === this.normalize(pair.word)) {
        correctCount += 1;
      }
    }

    const total = expected.pairs.length;
    const isCorrect = correctCount === total;
    const score = total > 0 ? Math.round((correctCount / total) * 100) : 0;

    return {
      exerciseId,
      isCorrect,
      score,
      feedback: isCorrect
        ? 'All picture-word pairs are correct!'
        : `${correctCount}/${total} pairs correct.`,
    };
  }

  private normalize(value: string): string {
    return value.trim().toLowerCase();
  }
}
