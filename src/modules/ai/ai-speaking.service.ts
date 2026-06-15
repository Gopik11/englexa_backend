import { Injectable } from '@nestjs/common';

@Injectable()
export class AiSpeakingService {
  processMessage(_payload: { userId?: string; message?: string }) {
    return {
      reply: 'Stub speaking response (Phase 1)',
      sessionId: 'stub-session',
      confidence: 0.0,
    };
  }
}
