import { Module } from '@nestjs/common';
import { GrammarContentGeneratorService } from './grammar-content-generator.service';
import { StubAiContentProvider } from './providers/stub-ai-content-provider';

@Module({
  providers: [GrammarContentGeneratorService, StubAiContentProvider],
  exports: [GrammarContentGeneratorService, StubAiContentProvider],
})
export class ContentPipelineModule {}
