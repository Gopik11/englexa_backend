import { PrismaService } from '../../prisma/prisma.service';

export async function listLearnerUserIds(
  prisma: PrismaService,
): Promise<string[]> {
  const users = await prisma.user.findMany({
    where: { role: 'LEARNER' },
    select: { id: true },
  });

  return users.map((user) => user.id);
}
