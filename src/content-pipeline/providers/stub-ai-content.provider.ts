import { Injectable, Logger } from '@nestjs/common';
import {
  AiContentProvider,
  GenerateExamplesInput,
  GenerateExercisesInput,
} from '../../modules/core/interfaces/ai-content-provider.interface';

/** Phase 1 stub — no external AI provider calls. */
@Injectable()
export class StubAiContentProvider implements AiContentProvider {
  private readonly logger = new Logger(StubAiContentProvider.name);

  async generateExercises(input: GenerateExercisesInput) {
    this.logger.debug(`AI exercise generation stub: topic=${input.topicId} count=${input.count}`);
    return [];
  }

  async generateExamples(input: GenerateExamplesInput) {
    this.logger.debug(`AI example generation stub: topic=${input.topicId} count=${input.count}`);
    return [];
  }
}
