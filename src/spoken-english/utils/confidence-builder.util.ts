const CONFIDENCE_TIPS = [
  'Try saying it aloud three times — repetition builds muscle memory.',
  'Great job! You are improving with every attempt.',
  'Focus on clarity, not speed. Slow and clear beats fast and unclear.',
  'Break the sentence into smaller chunks, then say the full phrase.',
  'Listen once, repeat twice, then say it in your own words.',
  'Smile while you speak — it helps your pronunciation sound more natural.',
  'Record yourself and compare with the example sentence.',
  'Pause briefly between phrases to stay calm and confident.',
];

export function buildConfidenceTip(seed?: string | number): string {
  if (seed === undefined) {
    return CONFIDENCE_TIPS[Math.floor(Math.random() * CONFIDENCE_TIPS.length)]!;
  }

  const text = String(seed);
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }

  return CONFIDENCE_TIPS[Math.abs(hash) % CONFIDENCE_TIPS.length]!;
}

export function buildPracticeConfidenceTip(input: {
  grammarScore: number;
  pronunciationScore: number;
  fluencyScore: number;
}): string {
  const average =
    (input.grammarScore + input.pronunciationScore + input.fluencyScore) / 3;

  if (average >= 85) {
    return 'Excellent work! Your delivery sounds confident — keep practicing daily.';
  }
  if (average >= 70) {
    return 'Good progress! Try saying it aloud three times to lock in the rhythm.';
  }
  if (input.pronunciationScore < input.grammarScore) {
    return 'Focus on clarity, not speed. Repeat each word clearly before speeding up.';
  }
  return 'Break the sentence into smaller chunks, then say the full phrase with confidence.';
}
