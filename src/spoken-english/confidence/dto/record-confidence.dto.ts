import { IsOptional, IsString, MinLength } from 'class-validator';

export class RecordConfidenceDto {
  @IsString()
  @MinLength(1)
  prompt!: string;

  @IsString()
  @MinLength(1)
  userResponse!: string;

  @IsString()
  @MinLength(2)
  language!: string;

  @IsOptional()
  @IsString()
  sessionId?: string;
}
