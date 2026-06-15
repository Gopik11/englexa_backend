import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class PrismaGrammarHistoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  archiveTopic(topicId: string, contentJson: object, version: number) {
    return this.prisma.grammarTopicHistory.create({
      data: { topicId, contentJson, version },
    });
  }

  archiveExercise(
    exerciseId: string,
    topicId: string,
    contentJson: object,
    version: number,
  ) {
    return this.prisma.grammarExerciseHistory.create({
      data: { exerciseId, topicId, contentJson, version },
    });
  }

  archiveExample(
    exampleId: string,
    topicId: string,
    contentJson: object,
    version: number,
  ) {
    return this.prisma.grammarExampleHistory.create({
      data: { exampleId, topicId, contentJson, version },
    });
  }

  getTopicHistory(topicId: string) {
    return this.prisma.grammarTopicHistory.findMany({
      where: { topicId },
      orderBy: { version: 'desc' },
    });
  }

  getLatestTopicVersion(topicId: string) {
    return this.prisma.grammarTopic.findUnique({
      where: { id: topicId },
      select: { version: true },
    });
  }
}
