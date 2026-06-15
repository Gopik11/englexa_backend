import { PracticeLevel } from '../../modules/core/practice-level.type';

export interface GrammarContentGenerator {
  generateGrammarExercises(
    topicId: string,
    level: PracticeLevel,
    count: number,
  ): Promise<void>;
  generateExamples(
    topicId: string,
    level: PracticeLevel,
    count: number,
  ): Promise<void>;
}

export const GRAMMAR_CONTENT_GENERATOR = Symbol('GRAMMAR_CONTENT_GENERATOR');
