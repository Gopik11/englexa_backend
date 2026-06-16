import { IsOptional, IsString, MinLength } from 'class-validator';

export class AskQuestionDto {
  @IsString()
  @MinLength(1)
  text!: string;

  @IsOptional()
  @IsString()
  languageHint?: string;
}
