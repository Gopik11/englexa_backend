import { GenerateExamplesInput, GenerateExercisesInput } from '../../modules/core/interfaces/ai-content-provider.interface';

export interface GrammarContentGenerator {
  generateGrammarExercises(
    topicId: string,
    level: GenerateExercisesInput['level'],
    count: number,
  ): Promise<void>;
  generateExamples(
    topicId: string,
    level: GenerateExamplesInput['level'],
    count: number,
  ): Promise<void>;
}

export const GRAMMAR_CONTENT_GENERATOR = Symbol('GRAMMAR_CONTENT_GENERATOR');
