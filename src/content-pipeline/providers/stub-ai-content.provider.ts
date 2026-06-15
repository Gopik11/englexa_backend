import { Injectable, Logger } from '@nestjs/common';

/** Phase 1 stub — no external AI provider calls. */
@Injectable()
export class StubAiContentProvider {
  private readonly logger = new Logger(StubAiContentProvider.name);

  async generateTopic(input: any) {
    this.logger.debug(`AI topic stub: ${JSON.stringify(input)}`);
    return {
      slug: input?.slug ?? 'topic',
      name: 'Stub Topic',
      level: 'BEGINNER',
      description: 'Stub topic (Phase 1)',
    };
  }

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
