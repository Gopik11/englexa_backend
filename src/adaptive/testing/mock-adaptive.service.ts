import { AdaptiveModule } from '../entities/difficulty.entity';
import { DifficultyState } from '../entities/difficulty.entity';

export function createMockAdaptiveService() {
  const defaultState = (
    userId: string,
    module: AdaptiveModule,
    concept: string,
  ): DifficultyState => ({
    userId,
    module,
    concept,
    attempts: 0,
    correct: 0,
    incorrect: 0,
    streak: 0,
    difficulty_level: 2,
  });

  return {
    getDifficulty: jest
      .fn()
      .mockImplementation(
        async (userId: string, module: AdaptiveModule, concept: string) =>
          defaultState(userId, module, concept),
      ),
    recordResult: jest
      .fn()
      .mockImplementation(
        async (
          userId: string,
          module: AdaptiveModule,
          concept: string,
          isCorrect: boolean,
        ) => ({
          userId,
          module,
          concept,
          attempts: 1,
          correct: isCorrect ? 1 : 0,
          incorrect: isCorrect ? 0 : 1,
          streak: isCorrect ? 1 : 0,
          difficulty_level: 2,
        }),
      ),
    adjustDifficulty: jest.fn(),
  };
}
