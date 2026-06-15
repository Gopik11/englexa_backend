import { Injectable } from '@nestjs/common';
import { AiContentProvider } from '../../core/ai-content-provider.interface';

@Injectable()
export class StubAiContentProvider implements AiContentProvider {
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
