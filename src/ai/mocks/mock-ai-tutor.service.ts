import { Injectable } from '@nestjs/common';
import {
  AiTutorService,
  TutorInput,
  TutorResponse,
} from '../interfaces/ai-tutor.interface';
import { LearnerLevel } from '../../content/englexa-content-spec.constants';
import { TutorFeedbackService } from '../tutor-feedback.service';

@Injectable()
export class MockAiTutorService implements AiTutorService {
  constructor(private readonly tutorFeedbackService: TutorFeedbackService) {}

  async generateTutorResponse(input: TutorInput): Promise<TutorResponse> {
    const feedback = this.tutorFeedbackService.generateTutorFeedback({
      userSentence: input.message,
      userId: input.userId,
      level: this.mapLevel(input.context?.level),
    });

    const reply = [
      feedback.grammar_feedback,
      feedback.vocabulary_feedback,
      feedback.encouragement,
      feedback.next_step,
      feedback.micro_lesson,
    ]
      .filter(Boolean)
      .join('\n');

    return {
      reply,
      feedback: {
        grammar: feedback.grammar_feedback,
        vocabulary: feedback.vocabulary_feedback,
        suggestion: feedback.next_step,
      },
    };
  }

  private mapLevel(level?: string): LearnerLevel | undefined {
    if (!level) {
      return undefined;
    }

    const normalized = level.toUpperCase();
    if (normalized === 'A1' || normalized === 'A2') {
      return 'beginner';
    }
    if (normalized === 'B1') {
      return 'intermediate';
    }
    if (normalized === 'B2') {
      return 'advanced';
    }

    const lower = level.toLowerCase();
    if (lower === 'beginner' || lower === 'intermediate' || lower === 'advanced') {
      return lower;
    }

    return undefined;
  }
}
