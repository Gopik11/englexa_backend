import { BadRequestException } from '@nestjs/common';
import {
  rejectLocalFilePath,
  validateUploadedAudioFile,
  UploadedAudioFile,
} from '../../common/utils/audio-upload.util';

export type { UploadedAudioFile };

export { validateUploadedAudioFile, rejectLocalFilePath };

export function mapVoiceResponse(result: {
  transcribedText: string;
  english: string;
  local: string;
  audioBase64: string;
  confidenceTip: string;
  detectedLanguage: string;
  translatedQuestion: string;
  confidenceScore?: number;
  feedback?: string;
  encouragement?: string;
  aiDegraded?: boolean;
}) {
  return {
    transcribedText: result.transcribedText ?? '',
    transcript: result.transcribedText ?? '',
    english: result.english ?? '',
    explanation: result.english ?? '',
    local: result.local ?? '',
    audioBase64: result.audioBase64 ?? '',
    confidenceTip: result.confidenceTip ?? '',
    detectedLanguage: result.detectedLanguage ?? 'en',
    translatedQuestion: result.translatedQuestion ?? '',
    confidenceScore: result.confidenceScore ?? 0,
    feedback: result.feedback ?? '',
    encouragement: result.encouragement ?? '',
    aiDegraded: result.aiDegraded ?? false,
  };
}

export function ensureAudioPayload(
  file?: UploadedAudioFile,
  audioBase64?: string,
  audioUrl?: string,
): { audioBase64: string; mimeType: string } {
  rejectLocalFilePath(audioBase64);
  rejectLocalFilePath(audioUrl);

  if (file?.buffer?.length) {
    validateUploadedAudioFile(file);
    return {
      audioBase64: file.buffer.toString('base64'),
      mimeType: file.mimetype || 'audio/mp4',
    };
  }

  if (audioBase64?.trim()) {
    return { audioBase64: audioBase64.trim(), mimeType: 'audio/mp4' };
  }

  if (audioUrl?.trim()) {
    throw new BadRequestException(
      'Remote audioUrl is not supported. Upload multipart field "file" or send audioBase64.',
    );
  }

  throw new BadRequestException(
    'No audio file received. Upload multipart field "file" or send audioBase64.',
  );
}
