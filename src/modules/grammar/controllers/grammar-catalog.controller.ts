import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
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
@UseGuards(JwtAuthGuard)
export class GrammarCatalogController {
  constructor(private readonly contentService: GrammarContentService) {}

  @Get('topics')
  async getTopics() {
    return successResponse(await this.contentService.getTopics());
  }

  @Get('exercises/:topic')
  async getExercises(@Param('topic') topic: string) {
    return successResponse(await this.contentService.getExercises(topic));
  }

  @Get('examples/:topic')
  async getExamples(@Param('topic') topic: string) {
    return successResponse(await this.contentService.getExamples(topic));
  }
}

@Controller('exercises')
@UseGuards(JwtAuthGuard)
export class ExercisesAliasController {
  constructor(private readonly contentService: GrammarContentService) {}

  @Get()
  async getAllExercises() {
    return successResponse(await this.contentService.getAllExercises());
  }
}
