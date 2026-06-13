import { PrismaClient } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

type AnalyticsSnapshotDelegate = {
  upsert: (args: {
    where: {
      userId_period_snapshotDate: {
        userId: string;
        period: string;
        snapshotDate: Date;
      };
    };
    create: Record<string, unknown>;
    update: Record<string, unknown>;
  }) => Promise<unknown>;
  deleteMany: (args: {
    where: Record<string, unknown>;
  }) => Promise<{ count: number }>;
};

export function analyticsSnapshotClient(
  prisma: PrismaService | PrismaClient,
): AnalyticsSnapshotDelegate {
  return (prisma as PrismaClient & { analyticsSnapshot: AnalyticsSnapshotDelegate })
    .analyticsSnapshot;
}
