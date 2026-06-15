import { Body, Controller, Param, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { AppRole } from '../../../common/constants/roles';
import { Roles } from '../../../common/decorators/roles.decorator';
import { successResponse } from '../../../common/dto/api-response.dto';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { ContentPipelineService } from '../../content-pipeline/services/content-pipeline.service';
import { ContentPublishingService } from '../../content-pipeline/services/content-publishing.service';

@Controller('admin/grammar')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(AppRole.ADMIN)
export class GrammarAdminController {
  constructor(
    private readonly pipelineService: ContentPipelineService,
    private readonly publishingService: ContentPublishingService,
  ) {}

  @Post('generate-topic')
  async generateTopic(
    @Body()
    body: {
      slug: string;
      name?: string;
      level?: string;
      description?: string;
      tags?: string[];
    },
  ) {
    return successResponse(await this.pipelineService.generateTopic(body));
  }

  @Post('generate-exercises')
  async generateExercises(
    @Body()
    body: {
      topicSlug: string;
      topicId?: string;
      count?: number;
      level?: string;
    },
  ) {
    return successResponse(await this.pipelineService.generateExercises(body));
  }

  @Post('generate-examples')
  async generateExamples(
    @Body()
    body: {
      topicSlug: string;
      topicId?: string;
      count?: number;
    },
  ) {
    return successResponse(await this.pipelineService.generateExamples(body));
  }

  @Post('approve/:draftId')
  async approveDraft(
    @Param('draftId') draftId: string,
    @Query('type') type: 'topic' | 'exercise' | 'example',
  ) {
    return successResponse(await this.publishingService.approveDraft(draftId, type));
  }

  @Post('reject/:draftId')
  async rejectDraft(
    @Param('draftId') draftId: string,
    @Query('type') type: 'topic' | 'exercise' | 'example',
  ) {
    return successResponse(await this.publishingService.rejectDraft(draftId, type));
  }
}
