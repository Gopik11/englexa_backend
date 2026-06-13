import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';

export class PronunciationRequestDto {
  @IsString()
  text!: string;

  @IsOptional()
  @IsUUID()
  sentenceId?: string;

  @IsOptional()
  @IsBoolean()
  audioSimulated?: boolean;
}
