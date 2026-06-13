import { ProgressService } from './progress.service';
import { GRAMMAR_XP_PER_CORRECT } from './constants/grammar-progress.constants';

describe('ProgressService — grammar concept progress', () => {
  const prisma = {
    grammarConceptProgress: {
      upsert: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
  };

  const gamificationService = {
    recordActivity: jest.fn(),
    addXp: jest.fn(),
    getProfile: jest.fn(),
  };

  const profileService = {
    awardXpForActivity: jest.fn(),
  };

  const service = new ProgressService(
    prisma as never,
    {} as never,
    {} as never,
    gamificationService as never,
    profileService as never,
    {} as never,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('incrementGrammarXP updates concept mastery without calling gamification', async () => {
    prisma.grammarConceptProgress.upsert.mockResolvedValue({
      id: 'row-1',
      userId: 'user-1',
      concept: 'Articles',
      correctCount: 2,
      mistakeCount: 1,
      masteryScore: 50,
      xpEarned: 10,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    prisma.grammarConceptProgress.update.mockResolvedValue({
      id: 'row-1',
      userId: 'user-1',
      concept: 'Articles',
      correctCount: 2,
      mistakeCount: 1,
      masteryScore: 67,
      xpEarned: 10,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await service.incrementGrammarXP('user-1', 'Articles');

    expect(gamificationService.recordActivity).not.toHaveBeenCalled();
    expect(gamificationService.addXp).not.toHaveBeenCalled();
    expect(result.xpAwarded).toBe(GRAMMAR_XP_PER_CORRECT);
    expect(result.mastery).toEqual({
      concept: 'Articles',
      correctCount: 2,
      mistakeCount: 1,
      masteryScore: 67,
      xpEarned: 10,
    });
  });

  it('recordGrammarMistake tracks mistakes without awarding XP', async () => {
    prisma.grammarConceptProgress.upsert.mockResolvedValue({
      id: 'row-2',
      userId: 'user-2',
      concept: 'Past Tense',
      correctCount: 1,
      mistakeCount: 2,
      masteryScore: 100,
      xpEarned: 10,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    prisma.grammarConceptProgress.update.mockResolvedValue({
      id: 'row-2',
      userId: 'user-2',
      concept: 'Past Tense',
      correctCount: 1,
      mistakeCount: 2,
      masteryScore: 33,
      xpEarned: 10,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await service.recordGrammarMistake('user-2', 'Past Tense');

    expect(gamificationService.recordActivity).not.toHaveBeenCalled();
    expect(gamificationService.addXp).not.toHaveBeenCalled();
    expect(result.xpAwarded).toBe(0);
    expect(result.mastery.masteryScore).toBe(33);
    expect(result.mastery.mistakeCount).toBe(2);
  });

  it('getGrammarConceptMastery returns ordered concept rows', async () => {
    prisma.grammarConceptProgress.findMany.mockResolvedValue([
      {
        id: 'row-a',
        userId: 'user-3',
        concept: 'Articles',
        correctCount: 5,
        mistakeCount: 0,
        masteryScore: 100,
        xpEarned: 50,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    const rows = await service.getGrammarConceptMastery('user-3');

    expect(rows).toHaveLength(1);
    expect(rows[0]?.concept).toBe('Articles');
  });
});
