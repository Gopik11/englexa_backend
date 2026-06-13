import { PrismaService } from '../../prisma/prisma.service';
import { dailyActivityClient } from './prisma-daily-activity';
import { startOfUtcDay } from './time-series-generator';

const MODULE_BY_ACTIVITY: Record<string, string> = {
  grammar_correct: 'grammar',
  vocabulary_correct: 'vocabulary',
  reading_completed: 'reading',
  speaking_submission: 'speaking',
  writing_submission: 'writing',
};

export function moduleForActivity(activity: string): string | null {
  return MODULE_BY_ACTIVITY[activity] ?? null;
}

export async function recordDailyActivity(
  prisma: PrismaService,
  userId: string,
  options?: { module?: string; minutes?: number },
): Promise<void> {
  const activityDate = startOfUtcDay(new Date());
  const module = options?.module;
  const minutes = options?.minutes ?? 3;

  const client = dailyActivityClient(prisma);
  const existing = await client.findUnique({
    where: {
      userId_activityDate: { userId, activityDate },
    },
  });

  const modulesUsed = new Set(existing?.modulesUsed ?? []);
  if (module) {
    modulesUsed.add(module);
  }

  await client.upsert({
    where: {
      userId_activityDate: { userId, activityDate },
    },
    create: {
      userId,
      activityDate,
      activityCount: 1,
      minutesSpent: minutes,
      modulesUsed: [...modulesUsed],
    },
    update: {
      activityCount: { increment: 1 },
      minutesSpent: { increment: minutes },
      modulesUsed: [...modulesUsed],
    },
  });
}
