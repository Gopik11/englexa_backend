import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { AiContentProviderService } from '../../modules/content-pipeline/providers/ai-content-provider.service';
import { normalizeLanguageCode } from '../constants/supported-languages.constants';
import { RecordConfidenceDto } from './dto/record-confidence.dto';
import { ConfidenceRepository } from './confidence.repository';

export interface ConfidenceEvaluation {
  confidenceScore: number;
  feedback: string;
  encouragement: string;
  grammarScore: number;
  pronunciationScore: number;
  fluencyScore: number;
  clarityScore: number;
  confidenceMarkers: number;
  sessionId: string;
}

@Injectable()
export class ConfidenceService {
  private readonly logger = new Logger(ConfidenceService.name);

  constructor(
    private readonly repository: ConfidenceRepository,
    private readonly aiProvider: AiContentProviderService,
  ) {}

  async recordConfidence(userId: string, dto: RecordConfidenceDto) {
    const language = normalizeLanguageCode(dto.language);
    const evaluation = await this.evaluateAndPersist({
      userId,
      sessionId: dto.sessionId ?? randomUUID(),
      prompt: dto.prompt,
      userResponse: dto.userResponse,
      language,
    });

    return {
      confidenceScore: evaluation.confidenceScore,
      feedback: evaluation.feedback,
      encouragement: evaluation.encouragement,
      sessionId: evaluation.sessionId,
    };
  }

  async getHistory(userId: string) {
    const rows = await this.repository.getUserConfidenceHistory(userId, 50);
    return rows.map((row) => ({
      id: row.id,
      sessionId: row.sessionId,
      prompt: row.prompt,
      userResponse: row.userResponse,
      aiFeedback: row.aiFeedback,
      confidenceScore: row.confidenceScore,
      language: row.language,
      createdAt: row.createdAt,
    }));
  }

  async evaluateAndPersist(input: {
    userId: string;
    sessionId?: string;
    prompt: string;
    userResponse: string;
    language: string;
  }): Promise<ConfidenceEvaluation> {
    const sessionId = input.sessionId ?? randomUUID();
    const evaluationText = `Prompt: ${input.prompt}\nUser response: ${input.userResponse}`;
    const evaluation = await this.aiProvider.evaluateSpeakingConfidence(
      evaluationText,
    );

    await this.repository.saveConfidenceRecord(
      input.userId,
      sessionId,
      input.prompt,
      input.userResponse,
      evaluation.feedback,
      evaluation.confidenceScore,
      input.language,
    );

    this.logger.log(
      `confidence saved user=${input.userId} score=${evaluation.confidenceScore}`,
    );

    return {
      ...evaluation,
      sessionId,
    };
  }
}
