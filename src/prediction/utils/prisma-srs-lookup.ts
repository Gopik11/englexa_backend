import { PrismaClient } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

type SrsLookupDelegate = {
  findUnique: (args: {
    where: { userId_module_concept: { userId: string; module: string; concept: string } };
  }) => Promise<{ nextReviewAt: Date } | null>;
};

export function srsLookupClient(
  prisma: PrismaService | PrismaClient,
): SrsLookupDelegate {
  return (prisma as PrismaClient & { srsReview: SrsLookupDelegate }).srsReview;
}
