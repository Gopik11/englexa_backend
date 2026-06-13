import { LearnerLevel } from '../../content/englexa-content-spec.constants';
import { pickDailyIndex } from './daily-seed';

export type PuzzleType =
  | 'unscramble'
  | 'missing_letter'
  | 'synonym_match'
  | 'antonym_match'
  | 'odd_one_out'
  | 'mini_riddle';

export interface PuzzleOfTheDay {
  type: PuzzleType;
  data: Record<string, unknown>;
  answer: string;
  hint: string;
}

interface PuzzleTemplate {
  type: PuzzleType;
  data: Record<string, unknown>;
  answer: string;
  hint: string;
}

const PUZZLES_BY_LEVEL: Record<LearnerLevel, PuzzleTemplate[]> = {
  beginner: [
    {
      type: 'unscramble',
      data: { letters: ['T', 'A', 'C'], prompt: 'Unscramble the letters to make a pet.' },
      answer: 'cat',
      hint: 'It says meow.',
    },
    {
      type: 'missing_letter',
      data: { word: 'h__lo', prompt: 'Fill in the missing letters.' },
      answer: 'hello',
      hint: 'A common greeting.',
    },
    {
      type: 'synonym_match',
      data: {
        word: 'happy',
        options: ['glad', 'sad', 'heavy', 'slow'],
        prompt: 'Pick the synonym.',
      },
      answer: 'glad',
      hint: 'Same positive feeling.',
    },
    {
      type: 'antonym_match',
      data: {
        word: 'hot',
        options: ['warm', 'cold', 'bright', 'fast'],
        prompt: 'Pick the antonym.',
      },
      answer: 'cold',
      hint: 'Think opposite temperature.',
    },
    {
      type: 'odd_one_out',
      data: {
        options: ['apple', 'banana', 'carrot', 'grape'],
        prompt: 'Which word is not a fruit?',
      },
      answer: 'carrot',
      hint: 'It is a vegetable.',
    },
    {
      type: 'mini_riddle',
      data: {
        riddle: 'I have keys but no locks. I have space but no room. What am I?',
      },
      answer: 'keyboard',
      hint: 'You are probably using one now.',
    },
  ],
  intermediate: [
    {
      type: 'unscramble',
      data: { letters: ['B', 'R', 'I', 'E', 'F'], prompt: 'Unscramble to find a word meaning short.' },
      answer: 'brief',
      hint: 'Not long.',
    },
    {
      type: 'missing_letter',
      data: { word: 'amb_guous', prompt: 'Complete the word meaning unclear.' },
      answer: 'ambiguous',
      hint: 'Two possible meanings.',
    },
    {
      type: 'synonym_match',
      data: {
        word: 'brief',
        options: ['short', 'long', 'heavy', 'late'],
        prompt: 'Choose the synonym.',
      },
      answer: 'short',
      hint: 'Not lengthy.',
    },
    {
      type: 'antonym_match',
      data: {
        word: 'expand',
        options: ['grow', 'shrink', 'build', 'raise'],
        prompt: 'Choose the antonym.',
      },
      answer: 'shrink',
      hint: 'Make smaller.',
    },
    {
      type: 'odd_one_out',
      data: {
        options: ['nevertheless', 'however', 'because', 'although'],
        prompt: 'Which word is not a contrast linker?',
      },
      answer: 'because',
      hint: 'It shows reason, not contrast.',
    },
    {
      type: 'mini_riddle',
      data: {
        riddle: 'The more you take, the more you leave behind. What are they?',
      },
      answer: 'footsteps',
      hint: 'Think about walking.',
    },
  ],
  advanced: [
    {
      type: 'unscramble',
      data: { letters: ['E', 'P', 'H', 'E', 'M', 'E', 'R', 'A', 'L'], prompt: 'Unscramble this adjective.' },
      answer: 'ephemeral',
      hint: 'Lasts a very short time.',
    },
    {
      type: 'missing_letter',
      data: { word: 'prag__tic', prompt: 'Complete the word meaning practical.' },
      answer: 'pragmatic',
      hint: 'Sensible and realistic.',
    },
    {
      type: 'synonym_match',
      data: {
        word: 'ubiquitous',
        options: ['omnipresent', 'rare', 'tiny', 'silent'],
        prompt: 'Pick the synonym.',
      },
      answer: 'omnipresent',
      hint: 'Found everywhere.',
    },
    {
      type: 'antonym_match',
      data: {
        word: 'concise',
        options: ['brief', 'wordy', 'clear', 'exact'],
        prompt: 'Pick the antonym.',
      },
      answer: 'wordy',
      hint: 'Too many words.',
    },
    {
      type: 'odd_one_out',
      data: {
        options: ['paradigm', 'framework', 'hypothesis', 'banana'],
        prompt: 'Which word does not belong?',
      },
      answer: 'banana',
      hint: 'It is not an abstract concept.',
    },
    {
      type: 'mini_riddle',
      data: {
        riddle: 'I speak without a mouth and hear without ears. What am I?',
      },
      answer: 'echo',
      hint: 'You hear it in mountains or empty halls.',
    },
  ],
};

export function generatePuzzleOfTheDay(
  userLevel: LearnerLevel,
  userId: string,
): PuzzleOfTheDay {
  const pool = PUZZLES_BY_LEVEL[userLevel];
  const index = pickDailyIndex(userId, 'puzzle-of-the-day', pool.length);
  const template = pool[index]!;

  return {
    type: template.type,
    data: { ...template.data },
    answer: template.answer,
    hint: template.hint,
  };
}
