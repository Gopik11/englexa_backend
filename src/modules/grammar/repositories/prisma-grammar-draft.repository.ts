import { Injectable, NotFoundException } from '@nestjs/common';
import { DraftStatus } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class PrismaGrammarDraftRepository {
  constructor(private readonly prisma: PrismaService) {}

  createTopicDraft(contentJson: object, version = 1) {
    return this.prisma.grammarTopicDraft.create({
      data: { contentJson, version, status: DraftStatus.DRAFT },
    });
  }

  createExerciseDraft(topicId: string | null, contentJson: object, version = 1) {
    return this.prisma.grammarExerciseDraft.create({
      data: { topicId, contentJson, version, status: DraftStatus.DRAFT },
    });
  }

  createExampleDraft(topicId: string | null, contentJson: object, version = 1) {
    return this.prisma.grammarExampleDraft.create({
      data: { topicId, contentJson, version, status: DraftStatus.DRAFT },
    });
  }

  async findTopicDraft(id: string) {
    const draft = await this.prisma.grammarTopicDraft.findUnique({ where: { id } });
    if (!draft) throw new NotFoundException(`Topic draft ${id} not found`);
    return draft;
  }

  async findExerciseDraft(id: string) {
    const draft = await this.prisma.grammarExerciseDraft.findUnique({ where: { id } });
    if (!draft) throw new NotFoundException(`Exercise draft ${id} not found`);
    return draft;
  }

  async findExampleDraft(id: string) {
    const draft = await this.prisma.grammarExampleDraft.findUnique({ where: { id } });
    if (!draft) throw new NotFoundException(`Example draft ${id} not found`);
    return draft;
  }

  rejectTopicDraft(id: string) {
    return this.prisma.grammarTopicDraft.update({
      where: { id },
      data: { status: DraftStatus.REJECTED },
    });
  }

  rejectExerciseDraft(id: string) {
    return this.prisma.grammarExerciseDraft.update({
      where: { id },
      data: { status: DraftStatus.REJECTED },
    });
  }

  rejectExampleDraft(id: string) {
    return this.prisma.grammarExampleDraft.update({
      where: { id },
      data: { status: DraftStatus.REJECTED },
    });
  }

  deleteTopicDraft(id: string) {
    return this.prisma.grammarTopicDraft.delete({ where: { id } });
  }

  deleteExerciseDraft(id: string) {
    return this.prisma.grammarExerciseDraft.delete({ where: { id } });
  }

  deleteExampleDraft(id: string) {
    return this.prisma.grammarExampleDraft.delete({ where: { id } });
  }
}
