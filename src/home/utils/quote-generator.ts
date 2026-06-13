import { QUOTE_SEEDS, QuoteCategory } from '../../content/home-daily.constants';
import { pickDailyIndex } from './daily-seed';

export interface QuoteOfTheDay {
  quote: string;
  category: QuoteCategory;
  explanation: string;
}

export function generateQuoteOfTheDay(userId: string): QuoteOfTheDay {
  const index = pickDailyIndex(userId, 'quote-of-the-day', QUOTE_SEEDS.length);
  const seed = QUOTE_SEEDS[index]!;

  return {
    quote: seed.quote,
    category: seed.category,
    explanation: seed.explanation,
  };
}
