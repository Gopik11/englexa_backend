export type SrsRating = 'again' | 'hard' | 'good' | 'easy';

export type SrsModule =
  | 'grammar'
  | 'vocabulary'
  | 'reading'
  | 'speaking'
  | 'writing';

export interface SrsReviewHistoryEntry {
  date: Date;
  rating: SrsRating;
}

export interface SrsItem {
  id: string;
  userId: string;
  module: string;
  concept: string;
  last_reviewed: Date;
  next_review: Date;
  interval: number;
  ease_factor: number;
  review_history: SrsReviewHistoryEntry[];
}

export interface SrsReviewContent {
  title: string;
  example: string;
  quick_practice: {
    question: string;
    options: string[];
    answer: string;
  };
}

export interface SrsDueItem extends SrsItem {
  content: SrsReviewContent;
}

export interface SrsStatus {
  total_items: number;
  due_count: number;
  reviewed_today: number;
  upcoming_count: number;
  due_items: SrsDueItem[];
}

export interface RecordReviewDto {
  module: string;
  concept: string;
  rating: SrsRating;
}
