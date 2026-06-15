import { Controller, Get, Param } from '@nestjs/common';
import { Public } from '../../../auth/decorators/public.decorator';
import { successResponse } from '../../../common/dto/api-response.dto';
import { GrammarContentService } from '../services/grammar-content.service';

/**
 * Phase-1 catalog routes (file-based JSON under data/grammar/).
 * Route coexistence note:
 * - GET /grammar/exercises/:topic  → Phase-1 catalog (this controller)
 * - GET /grammar/:level/:topic     → legacy grammar-practice adaptive flow
 * Both remain until Phase-2 DB migration.
 */
@Controller('grammar')
export class GrammarCatalogController {
  constructor(private readonly contentService: GrammarContentService) {}

  @Public()
  @Get('topics')
  async getTopics() {
    return successResponse(await this.contentService.getTopics());
  }

  @Public()
  @Get('exercises/:topic')
  async getExercises(@Param('topic') topic: string) {
    return successResponse(await this.contentService.getExercises(topic));
  }

  @Public()
  @Get('examples/:topic')
  async getExamples(@Param('topic') topic: string) {
    return successResponse(await this.contentService.getExamples(topic));
  }
}

@Controller('exercises')
export class ExercisesAliasController {
  constructor(private readonly contentService: GrammarContentService) {}

  @Public()
  @Get()
  async getAllExercises() {
    return successResponse(await this.contentService.getAllExercises());
  }
}
