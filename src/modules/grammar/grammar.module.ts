import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { ContentPipelineModule } from '../../content-pipeline/content-pipeline.module';
import {
  ExercisesAliasController,
  GrammarCatalogController,
} from './controllers/grammar-catalog.controller';
import { FileGrammarExerciseRepository } from './repositories/file-grammar-exercise.repository';
import { FileGrammarTopicRepository } from './repositories/file-grammar-topic.repository';
import {
  PrismaGrammarExampleRepository,
  PrismaGrammarTopicRepository,
} from './repositories/prisma-grammar.repository';
import { GrammarContentService } from './services/grammar-content.service';
import { GrammarProgressService } from './services/grammar-progress.service';

@Module({
  imports: [PrismaModule, ContentPipelineModule],
  controllers: [GrammarCatalogController, ExercisesAliasController],
  providers: [
    FileGrammarTopicRepository,
    FileGrammarExerciseRepository,
    PrismaGrammarTopicRepository,
    PrismaGrammarExampleRepository,
    GrammarContentService,
    GrammarProgressService,
  ],
  exports: [GrammarContentService, GrammarProgressService],
})
export class GrammarModule {}
