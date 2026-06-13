import { PrismaClient } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

type MiniLessonCompletionDelegate = {
  findMany: (args: {
    where: { userId: string };
    select: { lessonId: true };
  }) => Promise<Array<{ lessonId: string }>>;
  upsert: (args: {
    where: { userId_lessonId: { userId: string; lessonId: string } };
    create: {
      userId: string;
      lessonId: string;
      concept: string;
      module: string;
    };
    update: { completedAt: Date };
  }) => Promise<unknown>;
};

export function miniLessonCompletionClient(
  prisma: PrismaService | PrismaClient,
): MiniLessonCompletionDelegate {
  return (prisma as PrismaClient & {
    miniLessonCompletion: MiniLessonCompletionDelegate;
  }).miniLessonCompletion;
}
