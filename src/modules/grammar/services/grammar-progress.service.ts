import { Injectable } from '@nestjs/common';

@Injectable()
export class GrammarProgressService {
  getProgress(userId: string) {
    return { userId, progress: [] };
  }

  updateProgress(_userId: string, _payload: unknown) {
    return { success: true };
  }
}
