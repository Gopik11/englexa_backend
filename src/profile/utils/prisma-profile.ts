import { PrismaClient } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

type UserBadgeDelegate = {
  findMany: (args: {
    where: Record<string, unknown>;
    orderBy?: Record<string, unknown>;
  }) => Promise<UserBadgeRow[]>;
  upsert: (args: {
    where: { userId_badgeId: { userId: string; badgeId: string } };
    create: Record<string, unknown>;
    update: Record<string, unknown>;
  }) => Promise<UserBadgeRow>;
};

type UserAchievementDelegate = {
  findMany: (args: {
    where: Record<string, unknown>;
    orderBy?: Record<string, unknown>;
  }) => Promise<UserAchievementRow[]>;
  upsert: (args: {
    where: { userId_achievementId: { userId: string; achievementId: string } };
    create: Record<string, unknown>;
    update: Record<string, unknown>;
  }) => Promise<UserAchievementRow>;
};

export type UserBadgeRow = {
  id: string;
  userId: string;
  badgeId: string;
  name: string;
  description: string;
  earnedAt: Date;
};

export type UserAchievementRow = {
  id: string;
  userId: string;
  achievementId: string;
  name: string;
  description: string;
  progress: number;
  goal: number;
  earnedAt: Date | null;
};

export function userBadgeClient(
  prisma: PrismaService | PrismaClient,
): UserBadgeDelegate {
  return (prisma as PrismaClient & { userBadge: UserBadgeDelegate }).userBadge;
}

export function userAchievementClient(
  prisma: PrismaService | PrismaClient,
): UserAchievementDelegate {
  return (prisma as PrismaClient & { userAchievement: UserAchievementDelegate })
    .userAchievement;
}
