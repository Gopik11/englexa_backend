import {
  ENRICHMENT_ENCOURAGEMENT_TEMPLATES,
  GRAMMAR_RULE_EXPLANATIONS,
  GrammarRuleKey,
  LearnerLevel,
  NEXT_STEP_TEMPLATES,
  buildGrammarExplanation,
} from './englexa-content-spec.constants';
import {
  BuildEnrichedFeedbackInput,
  EnrichedFeedback,
  FeedbackExample,
} from './enriched-feedback.interface';

const COUNTER_EXAMPLES: Partial<
  Record<GrammarRuleKey, { incorrect: string; why: string }>
> = {
  article: {
    incorrect: 'I read book every day.',
    why: 'Countable singular nouns need an article before them.',
  },
  verb_tense: {
    incorrect: 'Yesterday, I walk to school.',
    why: 'Past time words like "yesterday" need past tense verbs.',
  },
  preposition: {
    incorrect: 'I have a meeting in Monday.',
    why: 'Days of the week use "on", not "in".',
  },
  simple_present: {
    incorrect: 'She walk to work every day.',
    why: 'Third-person singular verbs need -s in the simple present.',
  },
  present_continuous: {
    incorrect: 'Look! It rains.',
    why: 'Actions happening right now use present continuous.',
  },
  modal: {
    incorrect: 'You should to study more.',
    why: 'Modal verbs are followed by the base verb without "to".',
  },
};

const MINI_TIPS: Partial<Record<GrammarRuleKey, string>> = {
  article: 'Think: "a/an = one of many" — if you can count it singular, add an article.',
  verb_tense: 'Spot the time word first (yesterday, now, every day) — it tells you the tense.',
  preposition: 'Memory trick: "in a box, on a shelf, at a time".',
  simple_present: 'He/She/It? Add -s. I/You/We/They? Base verb.',
  present_continuous: 'Look for "now", "right now", or "Look!" — that signals -ing.',
  modal: 'Modal + base verb. No "to" after should, must, can, or will.',
  conditional: 'If + present, will + verb — like a cause and effect chain.',
  passive: 'Be + past participle: "is made", "was built", "has been sent".',
};

const CONCEPT_WHEN_NOT: Partial<Record<GrammarRuleKey, string>> = {
  article: 'Skip articles with plural or uncountable general statements (e.g. "Books are useful").',
  verb_tense: 'Do not change tense when quoting exact words or listing facts that are always true.',
  preposition: 'Fixed phrases (e.g. "in the morning") override the general in/on/at rule.',
  present_continuous: 'Do not use for habits, facts, or stative verbs like "know" or "believe".',
  modal: 'Modals express attitude, not facts — use simple present for routines instead.',
};

function pickEncouragement(userId: string, level: LearnerLevel): string {
  const templates = ENRICHMENT_ENCOURAGEMENT_TEMPLATES[level];
  const index =
    Math.abs(hashString(`${userId}:${Date.now()}`)) % templates.length;
  return templates[index]!;
}

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

function pickNextStep(userId: string): string {
  const index =
    Math.abs(hashString(`${userId}:next`)) % NEXT_STEP_TEMPLATES.length;
  return NEXT_STEP_TEMPLATES[index]!;
}

function resolveRuleKey(conceptKey?: string): GrammarRuleKey {
  const key = (conceptKey ?? 'article') as GrammarRuleKey;
  return key in GRAMMAR_RULE_EXPLANATIONS ? key : 'article';
}

function buildConceptExplanation(
  ruleKey: GrammarRuleKey,
  isCorrect: boolean,
): string {
  const entry = GRAMMAR_RULE_EXPLANATIONS[ruleKey];
  const whenNot = CONCEPT_WHEN_NOT[ruleKey];

  if (isCorrect) {
    return `You applied the ${ruleKey.replace(/_/g, ' ')} pattern correctly. ${entry.rule}`;
  }

  const lines = [
    entry.rule,
    `This matters because it helps your sentence sound natural and clear to listeners.`,
    `Use this when the sentence matches the ${ruleKey.replace(/_/g, ' ')} pattern.`,
  ];
  if (whenNot) {
    lines.push(`It does NOT apply when: ${whenNot}`);
  }
  return lines.join(' ');
}

function buildExamples(
  ruleKey: GrammarRuleKey,
  correctAnswer?: string,
): FeedbackExample[] {
  const entry = GRAMMAR_RULE_EXPLANATIONS[ruleKey];
  const examples: FeedbackExample[] = [
    {
      text: entry.example,
      isCorrect: true,
      note: 'This follows the rule correctly.',
    },
  ];
  if (correctAnswer?.trim()) {
    examples.push({
      text: correctAnswer.trim(),
      isCorrect: true,
      note: 'Your target answer uses the same pattern.',
    });
  }
  return examples;
}

function buildCounterExamples(ruleKey: GrammarRuleKey): FeedbackExample[] {
  const counter = COUNTER_EXAMPLES[ruleKey];
  if (!counter) {
    return [];
  }
  return [
    {
      text: counter.incorrect,
      isCorrect: false,
      note: counter.why,
    },
  ];
}

function buildMiniTip(ruleKey: GrammarRuleKey): string {
  return (
    MINI_TIPS[ruleKey] ??
    'Read your sentence aloud — if it sounds off, check the grammar pattern again.'
  );
}

function buildMicroLessonText(
  ruleKey: GrammarRuleKey,
  isCorrect: boolean,
): string | null {
  if (isCorrect) {
    return null;
  }
  const entry = GRAMMAR_RULE_EXPLANATIONS[ruleKey];
  const tip = buildMiniTip(ruleKey);
  return [
    `Let's revisit ${ruleKey.replace(/_/g, ' ')}.`,
    entry.rule,
    `Example: ${entry.example}`,
    `Try this: Rewrite the sentence using the same pattern with a new noun or verb.`,
    tip,
  ].join(' ');
}

/** Rich concept explanation for AI-generated exercises (generators). */
export function buildGeneratorConceptExplanation(
  ruleKey: GrammarRuleKey,
  exampleSentence?: string,
): string {
  const entry = GRAMMAR_RULE_EXPLANATIONS[ruleKey];
  const example = exampleSentence ?? entry.example;
  const whenNot = CONCEPT_WHEN_NOT[ruleKey];
  const tip = MINI_TIPS[ruleKey];

  return [
    entry.rule,
    'This matters because clear grammar helps listeners understand you quickly.',
    `Apply this when your sentence matches the ${ruleKey.replace(/_/g, ' ')} pattern.`,
    whenNot ? `It does NOT apply when: ${whenNot}` : '',
    `Example: ${example}.`,
    tip ? `Tip: ${tip}` : '',
  ]
    .filter(Boolean)
    .join(' ');
}

/** Builds unified enriched feedback for any practice module. */
export function buildEnrichedFeedback(
  input: BuildEnrichedFeedbackInput,
): EnrichedFeedback {
  const ruleKey = resolveRuleKey(input.conceptKey);
  const isCorrect = input.isCorrect;

  const conceptExplanation = isCorrect
    ? `Well done! ${buildConceptExplanation(ruleKey, true)}`
    : buildConceptExplanation(ruleKey, false);

  const examples = buildExamples(ruleKey, input.correctAnswer);
  const counterExamples = isCorrect ? [] : buildCounterExamples(ruleKey);
  const miniTip = isCorrect
    ? 'Keep noticing patterns — repetition builds fluency.'
    : buildMiniTip(ruleKey);

  const microLesson =
    input.microLesson ??
    (isCorrect ? null : buildMicroLessonText(ruleKey, false));

  return {
    corrected_sentence: input.correctedSentence,
    grammar_feedback: isCorrect
      ? undefined
      : input.grammarFeedback ?? buildGrammarExplanation(ruleKey),
    vocabulary_feedback: input.vocabularyFeedback,
    comprehension_feedback: input.comprehensionFeedback,
    pronunciation_feedback: input.pronunciationFeedback,
    fluency_feedback: input.fluencyFeedback,
    coherence_feedback: input.coherenceFeedback,
    structure_feedback: input.structureFeedback,
    concept_explanation: conceptExplanation,
    examples,
    counter_examples: counterExamples,
    mini_tip: miniTip,
    micro_lesson: microLesson,
    encouragement: pickEncouragement(input.userId, input.level),
    next_step: isCorrect
      ? 'Great work — try the next exercise!'
      : input.nextStep ?? pickNextStep(input.userId),
  };
}

/** Vocabulary-specific enrichment when grammar rule keys do not apply. */
export function buildVocabEnrichedFeedback(
  input: BuildEnrichedFeedbackInput & {
    word: string;
    meaning: string;
    exampleSentence: string;
  },
): EnrichedFeedback {
  const base = buildEnrichedFeedback(input);
  if (input.isCorrect) {
    return {
      ...base,
      concept_explanation: `You matched the meaning of "${input.word}" correctly. ${input.meaning}`,
      examples: [
        {
          text: input.exampleSentence,
          isCorrect: true,
          note: 'Natural use of the word in context.',
        },
      ],
      counter_examples: [],
      mini_tip: `Link "${input.word}" to a picture or situation you know — memory sticks better with context.`,
    };
  }

  return {
    ...base,
    concept_explanation: [
      `"${input.word}" means: ${input.meaning}`,
      'Getting the exact word matters because similar words can change the meaning of a sentence.',
      'Use this word when the context matches its meaning and register.',
      'It does NOT apply when a different part of speech or a near-synonym fits better.',
    ].join(' '),
    examples: [
      {
        text: input.exampleSentence,
        isCorrect: true,
        note: 'Correct usage in a full sentence.',
      },
    ],
    counter_examples: input.userAnswer?.trim()
      ? [
          {
            text: input.userAnswer.trim(),
            isCorrect: false,
            note: `Expected "${input.correctAnswer}" — check the meaning and spelling.`,
          },
        ]
      : [],
    mini_tip: `Say "${input.word}" in a sentence out loud three times — your brain remembers sound + meaning together.`,
    grammar_feedback: input.grammarFeedback,
  };
}

/** Reading comprehension enrichment. */
export function buildReadingEnrichedFeedback(
  input: BuildEnrichedFeedbackInput & { questionText: string },
): EnrichedFeedback {
  const base = buildEnrichedFeedback(input);
  return {
    ...base,
    comprehension_feedback:
      input.comprehensionFeedback ??
      (input.isCorrect
        ? 'You found the right detail in the passage.'
        : `Re-read the part of the passage that answers: "${input.questionText}".`),
    concept_explanation: input.isCorrect
      ? 'You understood the key detail from the text. Good comprehension!'
      : [
          'Reading questions test whether you can locate and interpret specific information.',
          'This matters because exams and real-life reading both require careful detail-checking.',
          'Apply this by scanning for keywords from the question before choosing an answer.',
          'It does NOT apply when the question asks for your opinion — then use inference instead.',
        ].join(' '),
    mini_tip: 'Underline question keywords, then hunt for synonyms in the passage.',
  };
}

/** Speaking enrichment with pronunciation/fluency fields. */
export function buildSpeakingEnrichedFeedback(
  input: BuildEnrichedFeedbackInput & {
    pronunciationScore: number;
    fluencyScore: number;
  },
): EnrichedFeedback {
  const base = buildEnrichedFeedback(input);
  const strong =
    input.pronunciationScore >= 80 && input.fluencyScore >= 80;

  return {
    ...base,
    pronunciation_feedback:
      input.pronunciationFeedback ??
      (strong
        ? 'Clear pronunciation — keep that steady pace.'
        : 'Focus on stressing key words and slowing down on tricky sounds.'),
    fluency_feedback:
      input.fluencyFeedback ??
      (strong
        ? 'Smooth delivery with good rhythm.'
        : 'Pause briefly at commas and practise linking common word pairs.'),
    concept_explanation: strong
      ? 'Your speech was clear and fluent. Keep practising natural rhythm.'
      : [
          'Speaking well means balancing accurate sounds with smooth delivery.',
          'This matters because listeners understand you faster when both are strong.',
          'Apply this when giving presentations, interviews, or everyday conversation.',
          'It does NOT apply when reading word-by-word from a script — aim for natural phrasing instead.',
        ].join(' '),
    mini_tip: 'Record yourself, listen once, then repeat — you will hear improvements fast.',
  };
}

/** Writing enrichment with coherence/structure fields. */
export function buildWritingEnrichedFeedback(
  input: BuildEnrichedFeedbackInput,
): EnrichedFeedback {
  const base = buildEnrichedFeedback(input);
  return {
    ...base,
    concept_explanation: input.isCorrect
      ? 'Your writing meets the task requirements. Keep refining clarity and flow.'
      : [
          'Good writing connects ideas clearly with correct grammar and structure.',
          'This matters because readers judge your message by how organised and accurate it is.',
          'Apply this when drafting emails, essays, or short answers.',
          'It does NOT apply to informal chat — adjust formality to your audience.',
        ].join(' '),
    mini_tip: 'Plan three beats: opening point, supporting detail, closing sentence.',
    coherence_feedback: input.coherenceFeedback,
    structure_feedback: input.structureFeedback,
  };
}
