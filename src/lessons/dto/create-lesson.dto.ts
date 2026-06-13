import { IsBoolean, IsEnum, IsObject, IsOptional, IsString } from 'class-validator';
import { Level } from '@prisma/client';

export class CreateLessonDto {
  @IsEnum(Level)
  level!: Level;

  @IsString()
  title!: string;

  @IsString()
  description!: string;

  @IsObject()
  contentJson!: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
