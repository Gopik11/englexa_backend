import { ExerciseType, Level, Prisma } from '@prisma/client';
export interface SeedExercise {
    type: ExerciseType;
    prompt: string;
    optionsJson: Prisma.InputJsonValue;
    answerJson: Prisma.InputJsonValue;
}
export interface SeedLesson {
    level: Level;
    title: string;
    description: string;
    contentJson: Prisma.InputJsonValue;
    exercises: SeedExercise[];
}
export declare const seedLessons: SeedLesson[];
