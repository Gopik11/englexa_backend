import { Injectable } from '@nestjs/common';
import {
  AiEvaluationService,
  EvaluationInput,
  EvaluationResult,
} from '../interfaces/ai-evaluation.interface';

@Injectable()
export class MockAiEvaluationService implements AiEvaluationService {
  async evaluateAnswer(input: EvaluationInput): Promise<EvaluationResult> {
    const userAnswer = input.userAnswer.trim().toLowerCase();
    const expected = (input.expectedAnswer ?? '').trim().toLowerCase();

    const isCorrect =
      expected.length > 0
        ? userAnswer === expected
        : userAnswer.length >= 3;

    const score = isCorrect ? 100 : Math.max(40, 100 - userAnswer.length * 2);

    return {
      score,
      isCorrect,
      feedback: isCorrect
        ? 'Well done! Your answer looks correct.'
        : 'Not quite right. Review the lesson hint and try again.',
      hints: isCorrect
        ? []
        : [
            'Check verb tense and word order.',
            'Compare your answer with the example in the lesson.',
          ],
    };
  }
}
