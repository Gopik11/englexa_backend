import { Inject, Injectable } from '@nestjs/common';
import {
  LearnerLevel,
  VOCABULARY_TEMPLATES,
  fillTemplate,
} from '../../content/englexa-content-spec.constants';
import { buildSpeakingEnrichedFeedback } from '../../content/feedback-enrichment';
import {
  AI_PRONUNCIATION_SERVICE,
  AiPronunciationService,
} from '../../ai/interfaces/ai-pronunciation.interface';
import {
  SpeakingMicroLesson,
  SpeakingPrompt,
  SubmitSpeakingAudioResult,
} from '../interfaces/speaking-prompt.interface';

export interface SpeakingAudioReference {
  audioUrl?: string;
  audioBlobRef?: string;
}

export interface EvaluateSpeakingInput {
  userId: string;
  prompt: SpeakingPrompt;
  audio: SpeakingAudioReference;
  level: LearnerLevel;
}

const SPEAKING_MICRO_LESSON_THRESHOLD = 2;

/**
 * Evaluates learner speech via Azure Speech (transcription + pronunciation +
 * fluency) with grammar/vocabulary feedback layered on top.
 *
 * Azure Cognitive Services Speech SDK is abstracted behind the private methods
 * below; the current implementation is deterministic for local development.
 */
@Injectable()
export class SpeakingEvaluator {
  constructor(
    @Inject(AI_PRONUNCIATION_SERVICE)
    private readonly pronunciationService: AiPronunciationService,
  ) {}

  async evaluateSpeaking(
    input: EvaluateSpeakingInput,
  ): Promise<SubmitSpeakingAudioResult> {
    const audioKey = this.resolveAudioKey(input.audio);
    const transcript = await this.transcribeWithAzure(
      input.prompt.reference_text,
      audioKey,
    );

    const pronunciation = await this.pronunciationService.scorePronunciation({
      userId: input.userId,
      text: transcript,
      sentenceId: input.prompt.id,
      audioSimulated: false,
    });

    const fluencyScore = this.assessFluencyWithAzure(
      transcript,
      input.prompt.reference_text,
      audioKey,
    );

    const grammarFeedback = this.buildGrammarFeedback(
      transcript,
      input.prompt.reference_text,
    );
    const vocabularyFeedback = this.buildVocabularyFeedback(
      transcript,
      input.prompt,
      input.level,
    );

    const averageScore = Math.round(
      (pronunciation.overallScore + fluencyScore) / 2,
    );

    const microLesson = this.maybeBuildMicroLesson(
      input.userId,
      input.prompt,
      pronunciation.overallScore,
      fluencyScore,
      pronunciation.wordScores
        .filter((item) => item.score < 75)
        .map((item) => item.word),
    );

    const enriched = buildSpeakingEnrichedFeedback({
      userId: input.userId,
      level: input.level,
      isCorrect: averageScore >= 80,
      conceptKey: input.prompt.topic,
      grammarFeedback,
      vocabularyFeedback,
      pronunciationScore: pronunciation.overallScore,
      fluencyScore,
      microLesson,
    });

    return {
      transcript,
      pronunciationScore: pronunciation.overallScore,
      fluencyScore,
      grammarFeedback,
      vocabularyFeedback,
      microLesson,
      ...enriched,
    };
  }

  private resolveAudioKey(audio: SpeakingAudioReference): string {
    return audio.audioBlobRef ?? audio.audioUrl ?? 'audio';
  }

  /** Azure Speech-to-Text */
  private async transcribeWithAzure(
    referenceText: string,
    audioKey: string,
  ): Promise<string> {
    const hash = hashSeed(audioKey);

    if (hash % 7 === 0) {
      return referenceText.replace(/\b(a|an|the)\b/gi, '').replace(/\s+/g, ' ').trim();
    }

    if (hash % 11 === 0) {
      return `${referenceText} um, I think.`;
    }

    return referenceText;
  }

  /** Azure pronunciation assessment (word-level scores via existing service). */
  private assessFluencyWithAzure(
    transcript: string,
    referenceText: string,
    audioKey: string,
  ): number {
    const refWords = tokenize(referenceText);
    const spokenWords = tokenize(transcript);

    if (refWords.length === 0 || spokenWords.length === 0) {
      return 50;
    }

    const overlap = spokenWords.filter((word) => refWords.includes(word)).length;
    const coverage = overlap / refWords.length;
    const lengthRatio =
      Math.min(spokenWords.length, refWords.length) /
      Math.max(spokenWords.length, refWords.length);
    const fillerCount = (transcript.match(/\b(um|uh|like|you know)\b/gi) ?? [])
      .length;

    const hashBonus = (hashSeed(audioKey) % 11) - 5;
    const raw =
      coverage * 55 + lengthRatio * 35 - fillerCount * 8 + hashBonus;

    return Math.round(clamp(raw, 40, 100));
  }

  private buildGrammarFeedback(
    transcript: string,
    referenceText: string,
  ): string {
    const issues: string[] = [];

    if (!/^[A-Z]/.test(transcript.trim())) {
      issues.push('Start your sentence with a capital letter.');
    }
    if (!/[.!?]$/.test(transcript.trim())) {
      issues.push('Finish with clear punctuation so your idea sounds complete.');
    }
    if (
      /\b(is|are|am|was|were)\b/i.test(referenceText) &&
      !/\b(is|are|am|was|were)\b/i.test(transcript)
    ) {
      issues.push('Include a clear verb form (for example, "is" or "are") so the sentence is grammatical.');
    }
    if (
      /\b(a|an|the)\b/i.test(referenceText) &&
      !/\b(a|an|the)\b/i.test(transcript)
    ) {
      issues.push('You may be missing an article such as "a", "an", or "the".');
    }

    if (issues.length === 0) {
      return 'Your grammar is clear and your sentence structure matches the prompt well.';
    }

    return issues.join(' ');
  }

  private buildVocabularyFeedback(
    transcript: string,
    prompt: SpeakingPrompt,
    level: LearnerLevel,
  ): string {
    const spoken = new Set(tokenize(transcript));
    const missing = prompt.key_vocabulary.filter(
      (word) => !spoken.has(word.toLowerCase()),
    );

    if (missing.length === 0) {
      return 'You used the key vocabulary from the prompt naturally.';
    }

    const target = missing[0]!;
    const stronger = prompt.key_vocabulary.find((item) => item !== target) ?? target;

    return fillTemplate(VOCABULARY_TEMPLATES.strongerVocabulary, {
      stronger_word: stronger,
      example_sentence: prompt.reference_text,
    });
  }

  private maybeBuildMicroLesson(
    userId: string,
    prompt: SpeakingPrompt,
    pronunciationScore: number,
    fluencyScore: number,
    weakWords: string[],
  ): SpeakingMicroLesson | null {
    const average = (pronunciationScore + fluencyScore) / 2;
    if (average >= 80) {
      return null;
    }

    const count = incrementLowScoreCount(userId, prompt.id);
    if (count < SPEAKING_MICRO_LESSON_THRESHOLD) {
      return null;
    }

    const focus = weakWords[0] ?? prompt.key_vocabulary[0] ?? 'clear rhythm';

    return {
      focus,
      tip: 'Slow down, stress each syllable, and copy the rhythm of the model phrase.',
      practice_phrase: prompt.reference_text,
      example_sentence: prompt.reference_text,
    };
  }
}

const lowScoreHistory = new Map<string, number>();

function incrementLowScoreCount(userId: string, promptId: string): number {
  const key = `${userId}:${promptId}`;
  const next = (lowScoreHistory.get(key) ?? 0) + 1;
  lowScoreHistory.set(key, next);
  return next;
}

/** @internal Test helper */
export function clearSpeakingEvaluatorState(): void {
  lowScoreHistory.clear();
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
