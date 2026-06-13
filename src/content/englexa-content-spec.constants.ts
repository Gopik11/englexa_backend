/**
 * Programmatic mirror of englexa_content_spec.md (Version 1.0 — June 2026).
 * All tutor-facing strings MUST originate from this file — not inline in services.
 */

export type LearnerLevel = 'beginner' | 'intermediate' | 'advanced';

export type MistakeCategory =
  | 'spelling'
  | 'verb_tense'
  | 'missing_subject'
  | 'article'
  | 'preposition'
  | 'general';

export const GRAMMAR_TEMPLATES = {
  simpleCorrection:
    'Nice try! You wrote: {user_sentence}.\nA clearer version is: {corrected_sentence}.\nThis works because {rule_explanation}.\nExample: {example_sentence}.',
  spellingCorrection:
    'You\'re close! The word "{wrong_word}" seems like a spelling slip.\nThe correct spelling is "{correct_word}".\nExample: {example_sentence}.',
  verbTenseCorrection:
    'Good attempt. Your verb tense needs a small fix.\nCorrect version: {corrected_sentence}.\nWe use {tense_rule} in this situation.',
  missingSubject:
    'Your sentence needs a subject to be complete.\nCorrect version: {corrected_sentence}.\nExample: {example_sentence}.',
} as const;

export const VOCABULARY_TEMPLATES = {
  alternativeWord:
    'Nice choice! You can also use "{alternative_word}" here.\nExample: {example_sentence}.',
  naturalExpression:
    'Your sentence is correct, but a more natural way to say it is:\n{natural_sentence}.',
  strongerVocabulary:
    'To make your sentence more expressive, try using "{stronger_word}".\nExample: {example_sentence}.',
} as const;

export const ENCOURAGEMENT_BY_LEVEL: Record<LearnerLevel, string> = {
  beginner:
    'You\'re learning quickly. Keep practicing simple sentences like this.',
  intermediate:
    'You\'re improving your structure. Let\'s refine it a bit more.',
  advanced:
    'Great clarity. Now let\'s work on making it sound more natural.',
};

/** Rotating encouragement templates (5–7 per level) to avoid repetition. */
export const ENRICHMENT_ENCOURAGEMENT_TEMPLATES: Record<
  LearnerLevel,
  readonly string[]
> = {
  beginner: [
    'Nice work! Every attempt makes English feel more natural.',
    'You\'re building a strong foundation — keep going!',
    'Great effort! Small steps add up quickly.',
    'I can see you\'re trying — that\'s how fluency grows.',
    'Well done! Practice like this every day and you\'ll notice progress.',
    'Good job! You\'re closer than you think.',
    'Keep it up — mistakes are part of learning.',
  ],
  intermediate: [
    'Solid attempt! Let\'s polish one detail at a time.',
    'You\'re on the right track — refine and repeat.',
    'Nice! Your structure is improving with each try.',
    'Good thinking — a small tweak will make this shine.',
    'You\'re getting sharper — stay curious about the patterns.',
    'Well done! This kind of practice builds real confidence.',
    'Great effort — you handled most of it correctly.',
  ],
  advanced: [
    'Strong work! Now let\'s make it sound even more natural.',
    'Excellent clarity — fine-tuning will take you further.',
    'You\'re expressing ideas well — keep pushing for nuance.',
    'Impressive effort! Native-like flow comes from practice like this.',
    'Great precision — you\'re mastering the subtleties.',
    'Well crafted! One more pass and it\'ll be spot-on.',
    'You\'re performing at a high level — stay detail-focused.',
  ],
};

export const NEXT_STEP_TEMPLATES = [
  'Try using this word in a question next.',
  'Let\'s practice the past tense version now.',
  'Now try adding an adjective to make it richer.',
  'Let\'s build a longer sentence using the same idea.',
] as const;

export const MICRO_LESSONS: Record<
  Exclude<MistakeCategory, 'general' | 'missing_subject' | 'spelling'>,
  { mistakeKey: string; text: string }
> = {
  article: {
    mistakeKey: 'article_error',
    text:
      'You often skip articles. Use "a" before consonant sounds and "an" before vowel sounds.',
  },
  verb_tense: {
    mistakeKey: 'past_tense_error',
    text: 'Regular verbs form the past tense by adding -ed.',
  },
  preposition: {
    mistakeKey: 'preposition_error',
    text:
      'Use "in" for months/years, "on" for days/dates, and "at" for specific times.',
  },
};

/** Spec §13 example correction */
export const SPEC_SPELLING_EXAMPLES: Record<
  string,
  {
    correct: string;
    ruleExplanation: string;
    exampleSentence: string;
  }
> = {
  gret: {
    correct: 'greet',
    ruleExplanation: 'We use "greet" to mean "say hello".',
    exampleSentence: 'I greet my colleagues every morning.',
  },
};

export const VOCABULARY_SUGGESTIONS: Array<{
  pattern: RegExp;
  alternativeWord?: string;
  exampleSentence: string;
  strongerWord?: string;
  naturalSentence?: string;
}> = [
  {
    pattern: /\bwant\b/i,
    alternativeWord: 'would like',
    exampleSentence: 'I would like to learn English.',
  },
  {
    pattern: /\bgood\b/i,
    strongerWord: 'excellent',
    exampleSentence: 'That is an excellent idea.',
    alternativeWord: 'great',
  },
  {
    pattern: /\bnice\b/i,
    alternativeWord: 'pleasant',
    exampleSentence: 'We had a pleasant conversation.',
  },
];

export const MICRO_LESSON_THRESHOLD = 3;

/** Spec-derived rule + example pairs for grammar exercise explanations (§4, §8). */
export type GrammarRuleKey =
  | 'article'
  | 'verb_tense'
  | 'preposition'
  | 'missing_subject'
  | 'simple_present'
  | 'present_continuous'
  | 'past_continuous'
  | 'countable'
  | 'comparative'
  | 'modal'
  | 'adverb'
  | 'conditional'
  | 'relative_clause'
  | 'passive'
  | 'reported_speech'
  | 'perfect_tense'
  | 'connector';

export const GRAMMAR_RULE_EXPLANATIONS: Record<
  GrammarRuleKey,
  { rule: string; example: string }
> = {
  article: {
    rule: MICRO_LESSONS.article.text,
    example: 'I read a book every day.',
  },
  verb_tense: {
    rule: MICRO_LESSONS.verb_tense.text,
    example: 'Yesterday, I walked to school.',
  },
  preposition: {
    rule: MICRO_LESSONS.preposition.text,
    example: 'I have a meeting on Monday.',
  },
  missing_subject: {
    rule: 'Your sentence needs a subject to be complete.',
    example: 'I go to school every day.',
  },
  simple_present: {
    rule: 'Add -s to the verb with he, she, or it in the simple present.',
    example: 'She walks to work every day.',
  },
  present_continuous: {
    rule: 'Use present continuous for actions happening now.',
    example: 'Look! It is raining.',
  },
  past_continuous: {
    rule: 'Use past continuous for an action in progress at a past time.',
    example: 'I was cooking when the phone rang.',
  },
  countable: {
    rule: 'Use "many" with countable nouns and "much" with uncountable nouns.',
    example: 'How many apples do you need?',
  },
  comparative: {
    rule: 'Add -er to short adjectives or use "more" with longer adjectives.',
    example: 'Today is colder than yesterday.',
  },
  modal: {
    rule: 'Modal verbs are followed by the base verb without "to".',
    example: 'You should study more.',
  },
  adverb: {
    rule: 'Use -ly adverbs to describe how an action is done.',
    example: 'She speaks clearly.',
  },
  conditional: {
    rule: 'Use "if + present, will + base verb" for real future possibilities.',
    example: 'If it rains, we will stay home.',
  },
  relative_clause: {
    rule: 'Use "who" for people and "which" or "that" for things.',
    example: 'The woman who lives next door is a doctor.',
  },
  passive: {
    rule: 'Passive voice uses be + past participle.',
    example: 'English is spoken here.',
  },
  reported_speech: {
    rule: 'Shift present tense to past tense in reported speech.',
    example: 'She said she was tired.',
  },
  perfect_tense: {
    rule: 'Use present perfect for past actions connected to now.',
    example: 'I have lived here since 2018.',
  },
  connector: {
    rule: 'Use connectors like "because" for reasons and "although" for contrast.',
    example: 'Although it was raining, we went for a walk.',
  },
};

/** Builds a concise explanation from spec rule text + example (§4.2 structure). */
export function buildGrammarExplanation(
  ruleKey: GrammarRuleKey,
  exampleSentence?: string,
): string {
  const entry = GRAMMAR_RULE_EXPLANATIONS[ruleKey];
  const example = exampleSentence ?? entry.example;
  return `${entry.rule} Example: ${example}.`;
}

export function fillTemplate(
  template: string,
  values: Record<string, string>,
): string {
  return Object.entries(values).reduce(
    (result, [key, value]) =>
      result.replaceAll(`{${key}}`, value),
    template,
  );
}
