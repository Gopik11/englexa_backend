import { IsOptional, IsString } from 'class-validator';

export class GenerateSpeakingDto {
  @IsString()
  level!: string;

  @IsString()
  topic!: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  message?: string;
}
