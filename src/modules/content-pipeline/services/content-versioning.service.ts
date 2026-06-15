import { Injectable } from '@nestjs/common';
import { PrismaGrammarHistoryRepository } from '../../grammar/repositories/prisma-grammar-history.repository';

@Injectable()
export class ContentVersioningService {
  constructor(private readonly historyRepository: PrismaGrammarHistoryRepository) {}

  async archiveTopic(topicId: string, contentJson: object, version: number) {
    return this.historyRepository.archiveTopic(topicId, contentJson, version);
  }

  async archiveExercise(
    exerciseId: string,
    topicId: string,
    contentJson: object,
    version: number,
  ) {
    return this.historyRepository.archiveExercise(
      exerciseId,
      topicId,
      contentJson,
      version,
    );
  }

  async archiveExample(
    exampleId: string,
    topicId: string,
    contentJson: object,
    version: number,
  ) {
    return this.historyRepository.archiveExample(
      exampleId,
      topicId,
      contentJson,
      version,
    );
  }

  nextVersion(current: number | undefined): number {
    return (current ?? 0) + 1;
  }
}
