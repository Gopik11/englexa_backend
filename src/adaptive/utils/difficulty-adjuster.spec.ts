import {
  applyAnswerToDifficulty,
  clampDifficulty,
} from './difficulty-adjuster';

describe('difficulty-adjuster', () => {
  const base = {
    attempts: 0,
    correct: 0,
    incorrect: 0,
    streak: 0,
    difficulty_level: 3,
  };

  it('clamps difficulty between 1 and 5', () => {
    expect(clampDifficulty(0)).toBe(1);
    expect(clampDifficulty(6)).toBe(5);
  });

  it('increases difficulty after 3 correct streak', () => {
    let state = { ...base, streak: 2, difficulty_level: 2 };
    state = applyAnswerToDifficulty(state, true);
    expect(state.streak).toBe(0);
    expect(state.difficulty_level).toBe(3);
  });

  it('decreases difficulty after 3 incorrect answers', () => {
    let state = { ...base, incorrect: 2, difficulty_level: 4 };
    state = applyAnswerToDifficulty(state, false);
    expect(state.incorrect).toBe(0);
    expect(state.difficulty_level).toBe(3);
  });

  it('resets incorrect counter on correct answer', () => {
    const state = applyAnswerToDifficulty(
      { ...base, incorrect: 2 },
      true,
    );
    expect(state.incorrect).toBe(0);
    expect(state.streak).toBe(1);
  });
});
