import { PracticeLevel } from '../../core/types/practice-level.type';

export function slugToDisplayName(slug: string): string {
  return slug
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function normalizePracticeLevel(raw: string): PracticeLevel | null {
  const value = raw.trim().toLowerCase();
  if (value === 'beginner' || value === 'intermediate' || value === 'advanced') {
    return value;
  }
  return null;
}

export function normalizeTopicSlug(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/g, '_');
}
