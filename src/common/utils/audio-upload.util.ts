import { BadRequestException } from '@nestjs/common';

const MAX_AUDIO_BYTES = 10 * 1024 * 1024;

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
    mimeType.startsWith('audio/') ||
    mimeType === 'application/octet-stream';
  const extensionAllowed =
    !extension ||
    ['m4a', 'mp4', 'aac', 'mp3', 'webm', 'wav'].includes(extension);

  if (!mimeAllowed && !extensionAllowed) {
    throw new BadRequestException(
      'Unsupported audio format. Upload m4a, mp4, mp3, webm, or wav.',
    );
  }
}

export function rejectLocalFilePath(value?: string): void {
  if (!value?.trim()) {
    return;
  }
  const normalized = value.trim().toLowerCase();
  if (
    normalized.startsWith('file://') ||
    normalized.startsWith('bytes://') ||
    normalized.includes(':\\') ||
    normalized.startsWith('/')
  ) {
    throw new BadRequestException(
      'Local file paths are not accepted. Upload audio using multipart field "file".',
    );
  }
}
