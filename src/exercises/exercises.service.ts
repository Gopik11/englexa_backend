import { Injectable, NotFoundException } from '@nestjs/common';
import { Exercise, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { LessonsService } from '../lessons/lessons.service';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';

@Injectable()
export class ExercisesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly lessonsService: LessonsService,
  ) {}

  async create(dto: CreateExerciseDto): Promise<Exercise> {
    await this.lessonsService.findById(dto.lessonId);

    return this.prisma.exercise.create({
      data: {
        lessonId: dto.lessonId,
        type: dto.type,
        prompt: dto.prompt,
        optionsJson: dto.optionsJson as Prisma.InputJsonValue,
        answerJson: dto.answerJson as Prisma.InputJsonValue,
      },
    });
  }

  async findByLesson(lessonId: string): Promise<Exercise[]> {
    await this.lessonsService.findById(lessonId);
    return this.prisma.exercise.findMany({
      where: { lessonId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findById(id: string): Promise<Exercise> {
    const exercise = await this.prisma.exercise.findUnique({ where: { id } });
    if (!exercise) {
      throw new NotFoundException('Exercise not found');
    }
    return exercise;
  }

  async update(id: string, dto: UpdateExerciseDto): Promise<Exercise> {
    await this.findById(id);
    return this.prisma.exercise.update({
      where: { id },
      data: {
        ...dto,
        optionsJson: dto.optionsJson
          ? (dto.optionsJson as Prisma.InputJsonValue)
          : undefined,
        answerJson: dto.answerJson
          ? (dto.answerJson as Prisma.InputJsonValue)
          : undefined,
      },
    });
  }

  async remove(id: string): Promise<Exercise> {
    await this.findById(id);
    return this.prisma.exercise.delete({ where: { id } });
  }
}
