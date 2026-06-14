import { Module } from '@nestjs/common';
import { AI_CONTENT_PROVIDER } from '../modules/core/interfaces/ai-content-provider.interface';
import { GRAMMAR_CONTENT_GENERATOR } from './interfaces/grammar-content-generator.interface';
import { StubAiContentProvider } from './providers/stub-ai-content.provider';
import { GrammarContentGeneratorService } from './services/grammar-content-generator.service';

@Module({
  providers: [
    StubAiContentProvider,
    GrammarContentGeneratorService,
    { provide: AI_CONTENT_PROVIDER, useExisting: StubAiContentProvider },
    { provide: GRAMMAR_CONTENT_GENERATOR, useExisting: GrammarContentGeneratorService },
  ],
  exports: [GrammarContentGeneratorService, AI_CONTENT_PROVIDER, GRAMMAR_CONTENT_GENERATOR],
})
export class ContentPipelineModule {}
