import { Module } from '@nestjs/common';
import {
  ExercisesAliasController,
  GrammarCatalogController,
} from './controllers/grammar-catalog.controller';
import { GrammarProgressController } from './controllers/grammar-progress.controller';
import { FileGrammarRepository } from './repositories/file-grammar.repository';
import { PrismaGrammarRepository } from './repositories/prisma-grammar.repository';
import { GrammarContentService } from './services/grammar-content.service';
import { GrammarProgressService } from './services/grammar-progress.service';

@Module({
  controllers: [
    GrammarCatalogController,
    ExercisesAliasController,
    GrammarProgressController,
  ],  providers: [
    FileGrammarRepository,
    PrismaGrammarRepository,
    GrammarContentService,
    GrammarProgressService,
  ],
  exports: [GrammarContentService, GrammarProgressService],
})
export class GrammarModule {}
