import { Injectable } from '@nestjs/common';
import { PrismaGrammarDraftRepository } from '../../grammar/repositories/prisma-grammar-draft.repository';
import { PrismaGrammarTopicRepository } from '../../grammar/repositories/prisma-grammar-topic.repository';
import { LlmAiContentProvider } from '../providers/llm-ai-content.provider';
import { ContentValidationService } from './content-validation.service';

@Injectable()
export class ContentPipelineService {
  constructor(
    private readonly aiProvider: LlmAiContentProvider,
    private readonly validationService: ContentValidationService,
    private readonly draftRepository: PrismaGrammarDraftRepository,
    private readonly topicRepository: PrismaGrammarTopicRepository,
  ) {}

  async generateTopic(input: {
    slug: string;
    name?: string;
    level?: string;
    description?: string;
    tags?: string[];
  }) {
    const generated = await this.aiProvider.generateTopic(input);
    this.validationService.validateTopic(generated);
    return this.draftRepository.createTopicDraft(generated);
  }

  async generateExercises(input: {
    topicSlug: string;
    topicId?: string;
    count?: number;
    level?: string;
  }) {
    const topic =
      (input.topicId
        ? await this.topicRepository.findById(input.topicId)
        : null) ?? (await this.topicRepository.findBySlug(input.topicSlug));

    const generatedList = await this.aiProvider.generateExercises({
      topicSlug: input.topicSlug,
      topicId: topic?.id,
      count: input.count,
      level: input.level,
    });

    const drafts = [];
    for (const generated of generatedList) {
      this.validationService.validateExercise(generated);
      drafts.push(
        await this.draftRepository.createExerciseDraft(
          topic?.id ?? null,
          generated,
        ),
      );
    }
    return drafts;
  }

  async generateExamples(input: {
    topicSlug: string;
    topicId?: string;
    count?: number;
  }) {
    const topic =
      (input.topicId
        ? await this.topicRepository.findById(input.topicId)
        : null) ?? (await this.topicRepository.findBySlug(input.topicSlug));

    const generatedList = await this.aiProvider.generateExamples({
      topicSlug: input.topicSlug,
      topicId: topic?.id,
      count: input.count,
    });

    const drafts = [];
    for (const generated of generatedList) {
      this.validationService.validateExample(generated);
      drafts.push(
        await this.draftRepository.createExampleDraft(topic?.id ?? null, generated),
      );
    }
    return drafts;
  }
}
