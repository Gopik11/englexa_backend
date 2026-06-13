import { Level, MissionType, PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { seedLessons } from './seed-data';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@englexa.com';
  const adminPassword = 'Admin123!';
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash,
      role: UserRole.ADMIN,
      country: 'US',
    },
  });

  for (const lesson of seedLessons) {
    const existing = await prisma.lesson.findFirst({
      where: { title: lesson.title, level: lesson.level },
    });

    const savedLesson =
      existing ??
      (await prisma.lesson.create({
        data: {
          level: lesson.level,
          title: lesson.title,
          description: lesson.description,
          contentJson: lesson.contentJson,
          isPublished: true,
        },
      }));

    if (!existing) {
      for (const exercise of lesson.exercises) {
        await prisma.exercise.create({
          data: {
            lessonId: savedLesson.id,
            type: exercise.type,
            prompt: exercise.prompt,
            optionsJson: exercise.optionsJson,
            answerJson: exercise.answerJson,
          },
        });
      }
    }
  }

  const missionSeeds = [
    {
      type: MissionType.WRITING,
      level: Level.A1,
      prompt: 'Write one sentence about your favorite food.',
      expectedAnswer: 'My favorite food is',
    },
    {
      type: MissionType.VOCAB,
      level: Level.A1,
      prompt: 'Use the word "happy" in a short sentence.',
      expectedAnswer: 'happy',
    },
    {
      type: MissionType.GRAMMAR,
      level: Level.A1,
      prompt: 'Write a sentence using "I am".',
      expectedAnswer: 'I am',
    },
    {
      type: MissionType.WRITING,
      level: Level.A2,
      prompt: 'Describe what you did yesterday in 2 sentences.',
      expectedAnswer: 'yesterday',
    },
    {
      type: MissionType.GRAMMAR,
      level: Level.A2,
      prompt: 'Write a sentence with a comparative adjective.',
      expectedAnswer: 'than',
    },
    {
      type: MissionType.VOCAB,
      level: Level.A2,
      prompt: 'Use the phrase "going to" in a sentence about future plans.',
      expectedAnswer: 'going to',
    },
  ];

  for (const mission of missionSeeds) {
    const existing = await prisma.dailyMission.findFirst({
      where: { prompt: mission.prompt, level: mission.level },
    });
    if (!existing) {
      await prisma.dailyMission.create({ data: mission });
    }
  }

  console.log('Seed complete.');
  console.log(`Admin login: ${adminEmail} / ${adminPassword}`);
  console.log(`Lessons seeded: ${seedLessons.length} (A1 + A2)`);
  console.log(`Missions seeded: ${missionSeeds.length}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
