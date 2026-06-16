/** ISO 639-1 codes supported by SpokenEnglishModule. */
export const SUPPORTED_LANGUAGE_CODES = [
  'hi',
  'ar',
  'ta',
  'te',
  'ml',
  'ur',
  'bn',
  'fil',
  'en',
] as const;

export type SupportedLanguageCode = (typeof SUPPORTED_LANGUAGE_CODES)[number];

export const SUPPORTED_LANGUAGE_LABELS: Record<SupportedLanguageCode, string> = {
  hi: 'Hindi',
  ar: 'Arabic',
  ta: 'Tamil',
  te: 'Telugu',
  ml: 'Malayalam',
  ur: 'Urdu',
  bn: 'Bengali',
  fil: 'Filipino',
  en: 'English',
};

export function normalizeLanguageCode(
  value?: string | null,
): SupportedLanguageCode {
  const normalized = (value ?? 'en').trim().toLowerCase();
  if (normalized === 'hindi') return 'hi';
  if (normalized === 'arabic') return 'ar';
  if (normalized === 'tamil') return 'ta';
  if (normalized === 'telugu') return 'te';
  if (normalized === 'malayalam') return 'ml';
  if (normalized === 'urdu') return 'ur';
  if (normalized === 'bengali') return 'bn';
  if (normalized === 'filipino' || normalized === 'tagalog') return 'fil';
  if (normalized === 'english') return 'en';
  if ((SUPPORTED_LANGUAGE_CODES as readonly string[]).includes(normalized)) {
    return normalized as SupportedLanguageCode;
  }
  return 'en';
}
