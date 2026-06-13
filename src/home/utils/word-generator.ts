import { LearnerLevel } from '../../content/englexa-content-spec.constants';
import { WORDS_BY_LEVEL, WordOfTheDaySeed } from '../../content/home-daily.constants';
import { pickDailyIndex } from './daily-seed';

export interface WordOfTheDay {
  word: string;
  level: LearnerLevel;
  meaning: string;
  example: string;
  synonyms: string[];
  antonyms: string[];
  pronunciation: string;
  mini_tip: string;
  micro_lesson: string;
}

export function generateWordOfTheDay(
  userLevel: LearnerLevel,
  userId: string,
): WordOfTheDay {
  const pool = WORDS_BY_LEVEL[userLevel];
  const index = pickDailyIndex(userId, 'word-of-the-day', pool.length);
  const seed: WordOfTheDaySeed = pool[index]!;

  return {
    word: seed.word,
    level: userLevel,
    meaning: seed.meaning,
    example: seed.example,
    synonyms: [...seed.synonyms],
    antonyms: [...seed.antonyms],
    pronunciation: seed.pronunciation,
    mini_tip: seed.mini_tip,
    micro_lesson: seed.micro_lesson,
  };
}
