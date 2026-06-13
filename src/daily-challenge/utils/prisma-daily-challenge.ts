import { PrismaClient } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

type DailyChallengeDelegate = {
  findUnique: (args: {
    where: { userId_date: { userId: string; date: Date } };
  }) => Promise<DailyChallengeRow | null>;
  findMany: (args: {
    where: Record<string, unknown>;
    orderBy?: Record<string, unknown>;
    take?: number;
  }) => Promise<DailyChallengeRow[]>;
  create: (args: { data: Record<string, unknown> }) => Promise<DailyChallengeRow>;
  update: (args: {
    where: { id: string };
    data: Record<string, unknown>;
  }) => Promise<DailyChallengeRow>;
};

export type DailyChallengeRow = {
  id: string;
  userId: string;
  date: Date;
  challenge: unknown;
  completed: boolean;
  score: number | null;
  createdAt: Date;
  updatedAt: Date;
};

export function dailyChallengeClient(
  prisma: PrismaService | PrismaClient,
): DailyChallengeDelegate {
  return (prisma as PrismaClient & { dailyChallenge: DailyChallengeDelegate })
    .dailyChallenge;
}
