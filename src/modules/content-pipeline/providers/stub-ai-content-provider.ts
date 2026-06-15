import { Injectable } from '@nestjs/common';
import { AiContentProvider } from '../../core/ai-content-provider.interface';

@Injectable()
export class StubAiContentProvider implements AiContentProvider {
  async generateTopic(input: any) {
    return {
      slug: input?.slug ?? 'topic',
      name: 'Stub Topic',
      level: 'BEGINNER',
      description: 'Stub topic (Phase 1)',
    };
  }

  async generateExplanation(_input: any) {
    return { output: 'Stub AI output (Phase 1)' };
  }

  async generateExercises(_input: any) {
    return { output: 'Stub AI output (Phase 1)' };
  }

  async generateExamples(_input: any) {
    return { output: 'Stub AI output (Phase 1)' };
  }
}
