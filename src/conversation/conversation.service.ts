import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Level } from '@prisma/client';
import { AdaptiveService } from '../adaptive/adaptive.service';
import { LearnerLevel } from '../content/englexa-content-spec.constants';
import { ErrorPatternsService } from '../error-patterns/error-patterns.service';
import { MasteryService } from '../mastery/mastery.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  ConversationAnalysis,
  ConversationMessage,
  ConversationSession,
  SendMessageInput,
  SendMessageResult,
} from './entities/conversation-session.entity';
import { detectIntent } from './utils/intent-detector';
import { ConversationPronunciationEvaluator } from './utils/pronunciation-evaluator';
import { conversationSessionClient } from './utils/prisma-conversation';
import {
  generateResponse,
  generateSessionSummary,
  generateWelcomeMessage,
} from './utils/response-generator';

@Injectable()
export class ConversationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly masteryService: MasteryService,
    private readonly errorPatternsService: ErrorPatternsService,
    private readonly adaptiveService: AdaptiveService,
    private readonly pronunciationEvaluator: ConversationPronunciationEvaluator,
  ) {}

  async startSession(userId: string): Promise<ConversationSession> {
    const level = await this.loadUserLevel(userId);
    const welcomeText = generateWelcomeMessage(level);
    const now = new Date();

    const messages: ConversationMessage[] = [
      {
        sender: 'ai',
        text: welcomeText,
        timestamp: now,
      },
    ];

    const row = await conversationSessionClient(this.prisma).create({
      data: {
        userId,
        status: 'active',
        messages,
        analysis: emptyAnalysis(),
        summary: '',
      },
    });

    return mapSession(row);
  }

  async sendMessage(
    userId: string,
    input: SendMessageInput,
  ): Promise<SendMessageResult> {
    const session = await this.loadSession(userId, input.sessionId);
    if (session.status === 'ended') {
      throw new BadRequestException('This conversation session has ended.');
    }

    const audioRef = input.audioBlobRef ?? input.audioUrl;
    let userText = input.text?.trim() ?? '';

    const pronunciation = await this.pronunciationEvaluator.evaluate(
      userId,
      audioRef,
      userText,
      input.sessionId,
    );

    if (!userText && pronunciation) {
      userText = pronunciation.transcript;
    }

    if (!userText) {
      throw new BadRequestException('Message text or audio is required.');
    }

    const analysis = this.analyzeMessage(userText, pronunciation);
    const intent = detectIntent(userText);
    const difficultyState = await this.adaptiveService.getDifficulty(
      userId,
      'speaking',
      intent,
    );

    const aiReply = generateResponse({
      intent,
      difficulty: difficultyState.difficulty_level,
      userMessage: userText,
      level: await this.loadUserLevel(userId),
      grammarCorrections: analysis.grammar_errors,
    });

    const now = new Date();
    const userMessage: ConversationMessage = {
      sender: 'user',
      text: userText,
      audioUrl: input.audioUrl,
      timestamp: now,
    };
    const aiMessage: ConversationMessage = {
      sender: 'ai',
      text: aiReply,
      timestamp: new Date(now.getTime() + 1),
    };

    const mergedAnalysis = mergeAnalysis(session.analysis, analysis, pronunciation);
    const updatedMessages = [...session.messages, userMessage, aiMessage];

    await this.updateMastery(userId, intent, mergedAnalysis, userText, aiReply);

    const row = await conversationSessionClient(this.prisma).update({
      where: { id: input.sessionId },
      data: {
        messages: updatedMessages,
        analysis: mergedAnalysis,
      },
    });

    const updatedSession = mapSession(row);

    return {
      session: updatedSession,
      aiReply,
      intent,
      pronunciationScore: pronunciation?.pronunciationScore,
      fluencyScore: pronunciation?.fluencyScore,
      grammarCorrections: analysis.grammar_errors,
      vocabularySuggestions: analysis.vocabulary_suggestions,
    };
  }

  analyzeMessage(
    text: string,
    pronunciation: Awaited<
      ReturnType<ConversationPronunciationEvaluator['evaluate']>
    >,
  ): ConversationAnalysis {
    const grammar_errors: string[] = [];
    const vocabulary_suggestions: string[] = [];

    if (!/^[A-Z]/.test(text.trim())) {
      grammar_errors.push('Start sentences with a capital letter.');
    }
    if (!/[.!?]$/.test(text.trim())) {
      grammar_errors.push('End sentences with punctuation for clarity.');
    }
    if (/\bi\b/.test(text)) {
      grammar_errors.push('Use "I" (capital I) when talking about yourself.');
    }
    if (/\b(is|are|am)\b/i.test(text) === false && text.split(/\s+/).length > 4) {
      grammar_errors.push('Check that your sentence includes a clear verb.');
    }

    const lower = text.toLowerCase();
    if (lower.includes('good') && !lower.includes('well')) {
      vocabulary_suggestions.push('Try "well" instead of "good" after verbs.');
    }
    if (lower.includes('very nice')) {
      vocabulary_suggestions.push('Try "wonderful" or "delightful" for variety.');
    }
    if (lower.includes('thing')) {
      vocabulary_suggestions.push('Replace "thing" with a more specific noun.');
    }

    return {
      grammar_errors,
      vocabulary_suggestions,
      pronunciation_score: pronunciation?.pronunciationScore,
      fluency_score: pronunciation?.fluencyScore,
    };
  }

  async generateResponseForIntent(
    intent: ReturnType<typeof detectIntent>,
    difficulty: number,
    patterns: string[],
    userMessage: string,
    level: LearnerLevel,
    grammarCorrections: string[],
  ): Promise<string> {
    return generateResponse({
      intent,
      difficulty,
      userMessage,
      level,
      grammarCorrections,
    });
  }

  async updateMastery(
    userId: string,
    concept: string,
    analysis: ConversationAnalysis,
    userText: string,
    referenceText: string,
  ): Promise<void> {
    const pronunciation = analysis.pronunciation_score ?? 75;
    const fluency = analysis.fluency_score ?? 75;
    const average = Math.round((pronunciation + fluency) / 2);
    const grammarPenalty = analysis.grammar_errors.length > 0 ? 10 : 0;
    const score = Math.max(0, average - grammarPenalty);
    const isCorrect = score >= 60;

    await this.masteryService.recordConceptActivity(userId, 'speaking', concept, {
      correct: isCorrect,
    });
    await this.adaptiveService.recordResult(userId, 'speaking', concept, isCorrect);

    if (!isCorrect || analysis.grammar_errors.length > 0) {
      await this.errorPatternsService.detectAndRecord(userId, {
        userAnswer: userText,
        correctAnswer: referenceText,
        module: 'speaking',
        concept,
        topic: concept,
      });
    }
  }

  async endSession(
    userId: string,
    sessionId: string,
  ): Promise<ConversationSession> {
    const session = await this.loadSession(userId, sessionId);
    const userMessages = session.messages.filter((item) => item.sender === 'user');
    const summary = generateSessionSummary(userMessages.length, session.analysis);

    const row = await conversationSessionClient(this.prisma).update({
      where: { id: sessionId },
      data: {
        status: 'ended',
        summary,
      },
    });

    return mapSession(row);
  }

  async getSession(
    userId: string,
    sessionId: string,
  ): Promise<ConversationSession> {
    return this.loadSession(userId, sessionId);
  }

  private async loadSession(
    userId: string,
    sessionId: string,
  ): Promise<ConversationSession> {
    const row = await conversationSessionClient(this.prisma).findFirst({
      where: { id: sessionId, userId },
    });
    if (!row) {
      throw new NotFoundException('Conversation session not found');
    }
    return mapSession(row);
  }

  private async loadUserLevel(userId: string): Promise<LearnerLevel> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { level: true },
    });
    return mapPrismaLevel(user?.level ?? Level.A2);
  }
}

function emptyAnalysis(): ConversationAnalysis {
  return {
    grammar_errors: [],
    vocabulary_suggestions: [],
  };
}

function mergeAnalysis(
  current: ConversationAnalysis,
  latest: ConversationAnalysis,
  pronunciation: Awaited<
    ReturnType<ConversationPronunciationEvaluator['evaluate']>
  >,
): ConversationAnalysis {
  const grammar_errors = [
    ...new Set([...current.grammar_errors, ...latest.grammar_errors]),
  ].slice(-6);
  const vocabulary_suggestions = [
    ...new Set([
      ...current.vocabulary_suggestions,
      ...latest.vocabulary_suggestions,
    ]),
  ].slice(-6);

  const pronunciationScores = [
    current.pronunciation_score,
    latest.pronunciation_score,
    pronunciation?.pronunciationScore,
  ].filter((value): value is number => value != null);
  const fluencyScores = [
    current.fluency_score,
    latest.fluency_score,
    pronunciation?.fluencyScore,
  ].filter((value): value is number => value != null);

  return {
    grammar_errors,
    vocabulary_suggestions,
    pronunciation_score:
      pronunciationScores.length > 0
        ? Math.round(
            pronunciationScores.reduce((sum, item) => sum + item, 0) /
              pronunciationScores.length,
          )
        : current.pronunciation_score,
    fluency_score:
      fluencyScores.length > 0
        ? Math.round(
            fluencyScores.reduce((sum, item) => sum + item, 0) /
              fluencyScores.length,
          )
        : current.fluency_score,
  };
}

function mapSession(row: {
  id: string;
  userId: string;
  status: string;
  messages: unknown;
  analysis: unknown;
  summary: string;
  createdAt: Date;
  updatedAt: Date;
}): ConversationSession {
  const messages = (row.messages as ConversationMessage[]).map((item) => ({
    ...item,
    timestamp: new Date(item.timestamp),
  }));
  const analysis = (row.analysis as ConversationAnalysis) ?? emptyAnalysis();

  return {
    sessionId: row.id,
    userId: row.userId,
    messages,
    analysis,
    summary: row.summary,
    status: row.status as ConversationSession['status'],
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function mapPrismaLevel(level: Level): LearnerLevel {
  switch (level) {
    case Level.A1:
    case Level.A2:
      return 'beginner';
    case Level.B1:
      return 'intermediate';
    case Level.B2:
    default:
      return 'advanced';
  }
}
