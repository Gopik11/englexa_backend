import { IsOptional, IsString, MinLength } from 'class-validator';

export class PracticeDto {
  @IsOptional()
  @IsString()
  prompt?: string;

  @IsOptional()
  @IsString()
  promptId?: string;

  @IsString()
  @MinLength(1)
  userResponse!: string;

  @IsOptional()
  @IsString()
  level?: string;

  @IsOptional()
  @IsString()
  languageHint?: string;
}
