import { PrismaClient } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

type SrsReviewDelegate = {
  findMany: (args: {
    where: Record<string, unknown>;
    orderBy?: Record<string, unknown>;
  }) => Promise<SrsRow[]>;
  findUnique: (args: {
    where: { userId_module_concept: { userId: string; module: string; concept: string } };
  }) => Promise<SrsRow | null>;
  upsert: (args: {
    where: { userId_module_concept: { userId: string; module: string; concept: string } };
    create: Record<string, unknown>;
    update: Record<string, unknown>;
  }) => Promise<SrsRow>;
  count: (args: { where: Record<string, unknown> }) => Promise<number>;
};

export type SrsRow = {
  id: string;
  userId: string;
  module: string;
  concept: string;
  lastReviewedAt: Date;
  nextReviewAt: Date;
  interval: number;
  easeFactor: number;
  reviewHistory: unknown;
  createdAt: Date;
  updatedAt: Date;
};

export function srsReviewClient(
  prisma: PrismaService | PrismaClient,
): SrsReviewDelegate {
  return (prisma as PrismaClient & { srsReview: SrsReviewDelegate }).srsReview;
}
