import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ContentSource,
  ContentStatus,
  GrammarExerciseType,
  PracticeLevel,
} from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { PrismaGrammarDraftRepository } from '../../grammar/repositories/prisma-grammar-draft.repository';
import { ContentVersioningService } from './content-versioning.service';

@Injectable()
export class ContentPublishingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly draftRepository: PrismaGrammarDraftRepository,
    private readonly versioningService: ContentVersioningService,
  ) {}

  async approveDraft(draftId: string, type: 'topic' | 'exercise' | 'example') {
    if (type === 'topic') return this.approveTopicDraft(draftId);
    if (type === 'exercise') return this.approveExerciseDraft(draftId);
    if (type === 'example') return this.approveExampleDraft(draftId);
    throw new BadRequestException('Invalid draft type');
  }

  async rejectDraft(draftId: string, type: 'topic' | 'exercise' | 'example') {
    if (type === 'topic') return this.draftRepository.rejectTopicDraft(draftId);
    if (type === 'exercise') return this.draftRepository.rejectExerciseDraft(draftId);
    if (type === 'example') return this.draftRepository.rejectExampleDraft(draftId);
    throw new BadRequestException('Invalid draft type');
  }

  private async approveTopicDraft(draftId: string) {
    const draft = await this.draftRepository.findTopicDraft(draftId);
    const content = draft.contentJson as Record<string, any>;
    const existing = await this.prisma.grammarTopic.findUnique({
      where: { slug: content.slug },
    });

    if (existing) {
      await this.versioningService.archiveTopic(
        existing.id,
        {
          slug: existing.slug,
          name: existing.name,
          level: existing.level,
          tags: existing.tags,
          description: existing.description,
          isPublished: existing.isPublished,
        },
        existing.version,
      );
      const updated = await this.prisma.grammarTopic.update({
        where: { id: existing.id },
        data: {
          name: content.name,
          level: content.level as PracticeLevel,
          tags: content.tags ?? [],
          description: content.description ?? null,
          isPublished: content.isPublished ?? true,
          version: this.versioningService.nextVersion(existing.version),
        },
      });
      await this.draftRepository.deleteTopicDraft(draftId);
      return updated;
    }

    const created = await this.prisma.grammarTopic.create({
      data: {
        slug: content.slug,
        name: content.name,
        level: content.level as PracticeLevel,
        tags: content.tags ?? [],
        description: content.description ?? null,
        isPublished: content.isPublished ?? true,
        version: 1,
      },
    });
    await this.draftRepository.deleteTopicDraft(draftId);
    return created;
  }

  private async approveExerciseDraft(draftId: string) {
    const draft = await this.draftRepository.findExerciseDraft(draftId);
    const content = draft.contentJson as Record<string, any>;
    const topic = await this.resolveTopic(content, draft.topicId);
    if (!topic) throw new NotFoundException('Topic not found for exercise draft');

    const existing = content.legacyId
      ? await this.prisma.grammarExercise.findFirst({
          where: { topicId: topic.id, legacyId: content.legacyId },
        })
      : null;

    if (existing) {
      await this.versioningService.archiveExercise(
        existing.id,
        topic.id,
        {
          legacyId: existing.legacyId,
          type: existing.type,
          question: existing.question,
          optionsJson: existing.optionsJson,
          answerJson: existing.answerJson,
          explanation: existing.explanation,
          difficulty: existing.difficulty,
        },
        existing.version,
      );
      const updated = await this.prisma.grammarExercise.update({
        where: { id: existing.id },
        data: {
          type: (content.type as GrammarExerciseType) ?? GrammarExerciseType.MCQ,
          question: content.question,
          optionsJson: content.optionsJson ?? null,
          answerJson: content.answerJson ?? {},
          explanation: content.explanation ?? null,
          difficulty: content.difficulty ?? 1,
          status: ContentStatus.APPROVED,
          source: ContentSource.AI_GENERATED,
          version: this.versioningService.nextVersion(existing.version),
        },
      });
      await this.draftRepository.deleteExerciseDraft(draftId);
      return updated;
    }

    const created = await this.prisma.grammarExercise.create({
      data: {
        topicId: topic.id,
        legacyId: content.legacyId ?? null,
        type: (content.type as GrammarExerciseType) ?? GrammarExerciseType.MCQ,
        question: content.question,
        optionsJson: content.optionsJson ?? null,
        answerJson: content.answerJson ?? {},
        explanation: content.explanation ?? null,
        difficulty: content.difficulty ?? 1,
        status: ContentStatus.APPROVED,
        source: ContentSource.AI_GENERATED,
        version: 1,
      },
    });
    await this.draftRepository.deleteExerciseDraft(draftId);
    return created;
  }

  private async approveExampleDraft(draftId: string) {
    const draft = await this.draftRepository.findExampleDraft(draftId);
    const content = draft.contentJson as Record<string, any>;
    const topic = await this.resolveTopic(content, draft.topicId);
    if (!topic) throw new NotFoundException('Topic not found for example draft');

    const created = await this.prisma.grammarExample.create({
      data: {
        topicId: topic.id,
        sentence: content.sentence,
        highlight: content.highlight ?? null,
        note: content.note ?? null,
        status: ContentStatus.APPROVED,
        source: ContentSource.AI_GENERATED,
        version: 1,
      },
    });
    await this.draftRepository.deleteExampleDraft(draftId);
    return created;
  }

  private async resolveTopic(
    content: Record<string, any>,
    topicId: string | null | undefined,
  ) {
    if (topicId) {
      const byId = await this.prisma.grammarTopic.findUnique({ where: { id: topicId } });
      if (byId) return byId;
    }
    const slug = content.topicSlug as string | undefined;
    if (slug) {
      return this.prisma.grammarTopic.findUnique({ where: { slug } });
    }
    return null;
  }
}
