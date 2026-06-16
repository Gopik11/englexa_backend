import { IsOptional, IsString, MinLength, ValidateIf } from 'class-validator';

export class VoiceInputDto {
  @ValidateIf((dto) => !dto.audioBase64)
  @IsString()
  @MinLength(1)
  audioUrl?: string;

  @ValidateIf((dto) => !dto.audioUrl)
  @IsString()
  @MinLength(1)
  audioBase64?: string;

  @IsOptional()
  @IsString()
  languageHint?: string;

  @IsOptional()
  @IsString()
  mimeType?: string;
}
