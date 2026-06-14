import { Injectable, Logger } from '@nestjs/common';
import { PracticeLevel } from '../../modules/core/types/practice-level.type';
import { GrammarContentGenerator } from '../interfaces/grammar-content-generator.interface';
import { StubAiContentProvider } from '../providers/stub-ai-content.provider';

/** Phase 1 scaffold — writes to DB in Phase 2 after review workflow. */
@Injectable()
export class GrammarContentGeneratorService implements GrammarContentGenerator {
  private readonly logger = new Logger(GrammarContentGeneratorService.name);

  constructor(private readonly aiProvider: StubAiContentProvider) {}

  async generateGrammarExercises(topicId: string, level: PracticeLevel, count: number): Promise<void> {
    this.logger.debug(`generateGrammarExercises stub: ${topicId}/${level}/${count}`);
    await this.aiProvider.generateExercises({ topicId, level, count });
    // TODO Phase 2: persist as DRAFT rows in grammar_exercises
  }

  async generateExamples(topicId: string, level: PracticeLevel, count: number): Promise<void> {
    this.logger.debug(`generateExamples stub: ${topicId}/${level}/${count}`);
    await this.aiProvider.generateExamples({ topicId, level, count });
    // TODO Phase 2: persist as DRAFT rows in grammar_examples
  }
}
