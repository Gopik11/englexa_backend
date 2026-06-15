import { Injectable, Logger } from '@nestjs/common';
import { AiContentProvider } from '../../modules/core/ai-content-provider.interface';

/** Phase 1 stub — no external AI provider calls. */
@Injectable()
export class StubAiContentProvider implements AiContentProvider {
  private readonly logger = new Logger(StubAiContentProvider.name);

  async generateExplanation(input: any) {
    this.logger.debug(`AI explanation stub: ${JSON.stringify(input)}`);
    return { output: 'Stub AI output (Phase 1)' };
  }

  async generateExercises(input: any) {
    this.logger.debug(`AI exercise generation stub: ${JSON.stringify(input)}`);
    return [];
  }

  async generateExamples(input: any) {
    this.logger.debug(`AI example generation stub: ${JSON.stringify(input)}`);
    return [];
  }
}
