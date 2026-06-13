import { PrismaService } from '../../prisma/prisma.service';

export interface AdaptiveDifficultyRecord {
  id: string;
  userId: string;
  module: string;
  concept: string;
  attempts: number;
  correct: number;
  incorrect: number;
  streak: number;
  difficultyLevel: number;
}

type AdaptiveDifficultyClient = {
  findUnique: (args: {
    where: {
      userId_module_concept: {
        userId: string;
        module: string;
        concept: string;
      };
    };
  }) => Promise<AdaptiveDifficultyRecord | null>;
  upsert: (args: {
    where: {
      userId_module_concept: {
        userId: string;
        module: string;
        concept: string;
      };
    };
    create: Record<string, unknown>;
    update: Record<string, unknown>;
  }) => Promise<AdaptiveDifficultyRecord>;
};

export function adaptiveDifficultyClient(
  prisma: PrismaService,
): AdaptiveDifficultyClient {
  return (prisma as unknown as { adaptiveDifficulty: AdaptiveDifficultyClient })
    .adaptiveDifficulty;
}
