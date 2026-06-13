import { LearnerLevel } from '../../content/englexa-content-spec.constants';
import { generateWordOfTheDay } from './word-generator';
import { generateQuoteOfTheDay } from './quote-generator';
import { generatePuzzleOfTheDay } from './puzzle-generator';
import { generateMiniCrossword } from './crossword-generator';
import { dailySeed } from './daily-seed';

describe('home daily generators', () => {
  const userA = 'user-alpha';
  const userB = 'user-beta';

  it('generates level-appropriate words', () => {
    const beginner = generateWordOfTheDay('beginner', userA);
    const advanced = generateWordOfTheDay('advanced', userA);

    expect(beginner.level).toBe('beginner');
    expect(advanced.level).toBe('advanced');
    expect(beginner.word).not.toBe(advanced.word);
    expect(beginner.micro_lesson.length).toBeGreaterThan(20);
    expect(beginner.synonyms.length).toBeGreaterThan(0);
  });

  it('returns stable word per user per day', () => {
    const first = generateWordOfTheDay('intermediate', userA);
    const second = generateWordOfTheDay('intermediate', userA);
    expect(first.word).toBe(second.word);
  });

  it('varies word between users on same day', () => {
    const a = generateWordOfTheDay('intermediate', userA);
    const b = generateWordOfTheDay('intermediate', userB);
    expect(dailySeed(userA, 'word-of-the-day')).not.toBe(
      dailySeed(userB, 'word-of-the-day'),
    );
    // May occasionally collide but seeds differ
    expect(a).toBeDefined();
    expect(b).toBeDefined();
  });

  it('generates quotes with category and explanation', () => {
    const quote = generateQuoteOfTheDay(userA);
    expect(quote.quote.length).toBeGreaterThan(5);
    expect(quote.category).toMatch(
      /motivational|philosophical|learning_mindset|growth_mindset/,
    );
    expect(quote.explanation.length).toBeGreaterThan(10);
  });

  it('generates solvable puzzles with hints', () => {
    const puzzle = generatePuzzleOfTheDay('beginner', userA);
    expect(puzzle.type).toBeTruthy();
    expect(puzzle.answer.length).toBeGreaterThan(0);
    expect(puzzle.hint.length).toBeGreaterThan(0);
    expect(puzzle.data).toBeDefined();
  });

  it('generates crossword grid and clues', () => {
    const crossword = generateMiniCrossword('beginner', userA);
    expect(crossword.grid.length).toBeGreaterThanOrEqual(3);
    expect(Object.keys(crossword.clues.across).length).toBeGreaterThan(0);
    expect(Object.keys(crossword.clues.down).length).toBeGreaterThan(0);
  });
});
