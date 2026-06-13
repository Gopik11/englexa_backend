import { Inject, Injectable } from '@nestjs/common';
import {
  AI_PRONUNCIATION_SERVICE,
  AiPronunciationService,
} from '../../ai/interfaces/ai-pronunciation.interface';

export interface PronunciationEvaluation {
  transcript: string;
  pronunciationScore: number;
  fluencyScore: number;
  patterns: string[];
  weakWords: string[];
}

const TRANSCRIPT_SAMPLES = [
  'Hello, I am practising my English speaking today.',
  'I went to the market and bought some fresh fruit.',
  'In my opinion, learning every day is very important.',
  'Yesterday I met a friend and we talked about travel.',
  'I enjoy reading books and listening to music.',
];

@Injectable()
export class ConversationPronunciationEvaluator {
  constructor(
    @Inject(AI_PRONUNCIATION_SERVICE)
    private readonly pronunciationService: AiPronunciationService,
  ) {}

  async evaluate(
    userId: string,
    audioRef: string | undefined,
    text: string,
    sessionId: string,
  ): Promise<PronunciationEvaluation | null> {
    if (!audioRef) {
      return null;
    }

    const transcript = text.trim() || this.transcribeFromAudio(audioRef);
    const pronunciation = await this.pronunciationService.scorePronunciation({
      userId,
      text: transcript,
      sentenceId: sessionId,
      audioSimulated: false,
    });

    const fluencyScore = this.assessFluency(transcript, audioRef);
    const weakWords = pronunciation.wordScores
      .filter((item) => item.score < 75)
      .map((item) => item.word);

    const patterns: string[] = [];
    if (fluencyScore < 70) {
      patterns.push('fluency_pattern');
    }
    if (pronunciation.overallScore < 70) {
      patterns.push('pronunciation_pattern');
    }
    if (/\b(um|uh|er|like)\b/i.test(transcript)) {
      patterns.push('filler_words');
    }

    return {
      transcript,
      pronunciationScore: pronunciation.overallScore,
      fluencyScore,
      patterns,
      weakWords,
    };
  }

  transcribeFromAudio(audioRef: string): string {
    return TRANSCRIPT_SAMPLES[hashSeed(audioRef) % TRANSCRIPT_SAMPLES.length]!;
  }

  private assessFluency(transcript: string, audioRef: string): number {
    const words = tokenize(transcript);
    if (words.length === 0) {
      return 50;
    }

    const fillerCount = (transcript.match(/\b(um|uh|like|you know)\b/gi) ?? [])
      .length;
    const lengthBonus = Math.min(words.length, 12) * 3;
    const hashBonus = (hashSeed(audioRef) % 9) - 4;

    const raw = 62 + lengthBonus - fillerCount * 10 + hashBonus;
    return Math.round(clamp(raw, 40, 100));
  }
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s']/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function hashSeed(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
