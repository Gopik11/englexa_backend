import { IsObject, IsOptional, IsString, IsUUID } from 'class-validator';

export class TutorContextDto {
  @IsOptional()
  @IsUUID()
  lessonId?: string;

  @IsOptional()
  @IsString()
  level?: string;

  @IsOptional()
  @IsString()
  topic?: string;
}

export class TutorRequestDto {
  @IsString()
  message!: string;

  @IsOptional()
  @IsObject()
  context?: TutorContextDto;
}
