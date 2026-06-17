import { BadRequestException } from '@nestjs/common';

const MAX_AUDIO_BYTES = 10 * 1024 * 1024;

const ALLOWED_AUDIO_MIME_TYPES = new Set([
  'audio/mp4',
  'audio/m4a',
  'audio/x-m4a',
  'audio/aac',
  'audio/mpeg',
  'audio/mp3',
  'audio/webm',
  'audio/wav',
  'audio/x-wav',
  'application/octet-stream',
]);

const ALLOWED_AUDIO_EXTENSIONS = new Set([
  'm4a',
  'mp4',
  'aac',
  'mp3',
  'webm',
  'wav',
]);

export interface UploadedAudioFile {
  buffer: Buffer;
  mimetype?: string;
  originalname?: string;
  size?: number;
}

export function validateUploadedAudioFile(file: UploadedAudioFile): void {
  if (!file.buffer?.length) {
    throw new BadRequestException('Uploaded audio file is empty');
  }

  const byteLength = file.size ?? file.buffer.length;
  if (byteLength > MAX_AUDIO_BYTES) {
    throw new BadRequestException(
      'Audio file exceeds the 10MB upload limit',
    );
  }

  const mimeType = file.mimetype?.toLowerCase() ?? '';
  const extension = file.originalname?.split('.').pop()?.toLowerCase() ?? '';

  const mimeAllowed =
    !mimeType ||
    ALLOWED_AUDIO_MIME_TYPES.has(mimeType) ||
    mimeType.startsWith('audio/');
  const extensionAllowed =
    !extension || ALLOWED_AUDIO_EXTENSIONS.has(extension);

  if (!mimeAllowed && !extensionAllowed) {
    throw new BadRequestException(
      'Unsupported audio format. Upload m4a, mp4, mp3, webm, or wav.',
    );
  }
}

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
  };
}
