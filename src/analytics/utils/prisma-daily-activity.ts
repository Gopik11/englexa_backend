import { PrismaService } from '../../prisma/prisma.service';

export interface UserDailyActivityRecord {
  activityDate: Date;
  activityCount: number;
  minutesSpent: number;
  modulesUsed: string[];
}

type DailyActivityClient = {
  findMany: (args: {
    where: { userId: string; activityDate?: { gte: Date } };
    orderBy?: { activityDate: 'asc' | 'desc' };
  }) => Promise<UserDailyActivityRecord[]>;
  findUnique: (args: {
    where: { userId_activityDate: { userId: string; activityDate: Date } };
  }) => Promise<UserDailyActivityRecord | null>;
  upsert: (args: {
    where: { userId_activityDate: { userId: string; activityDate: Date } };
    create: Record<string, unknown>;
    update: Record<string, unknown>;
  }) => Promise<unknown>;
};

export function dailyActivityClient(
  prisma: PrismaService,
): DailyActivityClient {
  return (prisma as unknown as { userDailyActivity: DailyActivityClient })
    .userDailyActivity;
}
