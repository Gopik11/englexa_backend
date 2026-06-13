import { SrsRating } from '../entities/srs.entity';

export interface SrsScheduleInput {
  interval: number;
  ease_factor: number;
  rating: SrsRating;
}

export interface SrsScheduleResult {
  interval: number;
  ease_factor: number;
  next_review: Date;
}

const MIN_EASE = 1.3;
const MAX_EASE = 2.5;
const MIN_INTERVAL = 1;

export function applySrsRating(input: SrsScheduleInput): SrsScheduleResult {
  let { interval, ease_factor } = input;
  const { rating } = input;

  switch (rating) {
    case 'again':
      interval = 1;
      ease_factor -= 0.2;
      break;
    case 'hard':
      interval = interval * 1.2;
      ease_factor -= 0.1;
      break;
    case 'good':
      interval = interval * 1.5;
      break;
    case 'easy':
      interval = interval * 2;
      ease_factor += 0.1;
      break;
    default:
      interval = interval * 1.5;
  }

  interval = Math.max(MIN_INTERVAL, Math.round(interval));
  ease_factor = clamp(ease_factor, MIN_EASE, MAX_EASE);

  const next_review = new Date();
  next_review.setUTCDate(next_review.getUTCDate() + interval);

  return {
    interval,
    ease_factor: roundEase(ease_factor),
    next_review,
  };
}

export function defaultEaseFactor(): number {
  return 2.0;
}

export function defaultInterval(): number {
  return 1;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function roundEase(value: number): number {
  return Math.round(value * 100) / 100;
}
