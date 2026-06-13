import { IsString, MinLength } from 'class-validator';

export class SubmitMissionDto {
  @IsString()
  @MinLength(1)
  answer!: string;
}
