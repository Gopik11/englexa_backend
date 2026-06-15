import { Injectable } from '@nestjs/common';
import { GrammarContentGenerator } from './grammar-content-generator.interface';

@Injectable()
export class GrammarContentGeneratorService implements GrammarContentGenerator {
  async generateTopicExplanation(topic: string) {
    return {
      topic,
      explanation: 'Stub explanation (Phase 1)',
      examples: [],
      exercises: [],
    };
  }

  async generateExamples(topic: string) {
    return {
      topic,
      explanation: 'Stub explanation (Phase 1)',
      examples: [],
      exercises: [],
    };
  }

  async generateExercises(topic: string) {
    return {
      topic,
      explanation: 'Stub explanation (Phase 1)',
      examples: [],
      exercises: [],
    };
  }
}
