import {
  MiniLesson,
  MiniLessonModule,
  QuickPracticeItem,
} from '../entities/mini-lesson.entity';

interface LessonTemplate {
  module: MiniLessonModule;
  title: string;
  explanation: string;
  examples: string[];
  common_mistakes: string[];
  quick_practice: QuickPracticeItem[];
  base_time: number;
}

const LESSON_TEMPLATES: Record<string, LessonTemplate> = {
  articles: {
    module: 'grammar',
    title: 'Articles: a, an, and the',
    explanation:
      'Use "a" before consonant sounds and "an" before vowel sounds for non-specific nouns. Use "the" when the listener knows which noun you mean.',
    examples: [
      'I saw a dog in the park.',
      'She ate an apple for lunch.',
      'The book on the table is mine.',
    ],
    common_mistakes: [
      'Using "a" before vowel sounds (a apple).',
      'Omitting "the" with unique nouns (sun, moon).',
      'Using "the" with general plural nouns.',
    ],
    quick_practice: [
      {
        question: 'Choose the correct article: I bought ___ umbrella.',
        options: ['a', 'an', 'the'],
        answer: 'an',
      },
      {
        question: 'Choose: ___ sun rises in the east.',
        options: ['A', 'An', 'The'],
        answer: 'The',
      },
    ],
    base_time: 5,
  },
  tenses: {
    module: 'grammar',
    title: 'English tenses overview',
    explanation:
      'Simple present describes habits and facts. Simple past describes finished actions. Present continuous describes actions happening now.',
    examples: [
      'She walks to work every day.',
      'They visited Paris last summer.',
      'He is studying right now.',
    ],
    common_mistakes: [
      'Using present continuous for permanent states.',
      'Forgetting irregular past forms (go → went).',
      'Mixing time markers (yesterday + present simple).',
    ],
    quick_practice: [
      {
        question: 'Yesterday, she ___ to the store.',
        options: ['go', 'goes', 'went'],
        answer: 'went',
      },
      {
        question: 'Look! It ___ outside.',
        options: ['rains', 'is raining', 'rained'],
        answer: 'is raining',
      },
    ],
    base_time: 6,
  },
  prepositions: {
    module: 'grammar',
    title: 'Prepositions of time and place',
    explanation:
      'Use "in" for months, years, and enclosed spaces. Use "on" for days and surfaces. Use "at" for specific times and points.',
    examples: [
      'The meeting is at 3 p.m.',
      'She lives in London.',
      'The keys are on the table.',
    ],
    common_mistakes: [
      'Saying "in Monday" instead of "on Monday".',
      'Using "at" for cities (at London).',
      'Confusing "in" and "on" for transport.',
    ],
    quick_practice: [
      {
        question: 'We meet ___ Friday.',
        options: ['in', 'on', 'at'],
        answer: 'on',
      },
      {
        question: 'She was born ___ May.',
        options: ['in', 'on', 'at'],
        answer: 'in',
      },
    ],
    base_time: 5,
  },
  subject_verb_agreement: {
    module: 'grammar',
    title: 'Subject–verb agreement',
    explanation:
      'Singular subjects take singular verbs; plural subjects take plural verbs. With "he/she/it", add -s to the base verb in present simple.',
    examples: [
      'He plays tennis on weekends.',
      'They play tennis on weekends.',
      'The dog runs fast.',
    ],
    common_mistakes: [
      'He play instead of He plays.',
      'The dogs runs instead of The dogs run.',
      'There is many instead of There are many.',
    ],
    quick_practice: [
      {
        question: 'She ___ English every day.',
        options: ['study', 'studies', 'studying'],
        answer: 'studies',
      },
      {
        question: 'The children ___ in the garden.',
        options: ['plays', 'play', 'playing'],
        answer: 'play',
      },
    ],
    base_time: 5,
  },
  modals: {
    module: 'grammar',
    title: 'Modal verbs',
    explanation:
      'Modals (can, must, should, might) express ability, obligation, advice, and possibility. They are followed by the base form of the verb without "to".',
    examples: [
      'You should drink more water.',
      'She can speak three languages.',
      'We must finish before noon.',
    ],
    common_mistakes: [
      'Adding "to" after modals (must to go).',
      'Using two modals together (can must).',
      'Confusing must not and don\'t have to.',
    ],
    quick_practice: [
      {
        question: 'You ___ wear a seatbelt. It is the law.',
        options: ['can', 'must', 'might'],
        answer: 'must',
      },
      {
        question: 'I ___ swim when I was five.',
        options: ['can', 'could', 'must'],
        answer: 'could',
      },
    ],
    base_time: 5,
  },
  word_order: {
    module: 'grammar',
    title: 'Word order in English',
    explanation:
      'Basic English sentences follow Subject + Verb + Object. Adverbs of frequency usually come before the main verb but after "be".',
    examples: [
      'She always drinks coffee in the morning.',
      'They gave him a gift.',
      'Where did you put the keys?',
    ],
    common_mistakes: [
      'Placing adverbs after the object incorrectly.',
      'Inverting subject and verb in statements.',
      'Putting time expressions in unnatural positions.',
    ],
    quick_practice: [
      {
        question: 'Which sentence is correct?',
        options: [
          'Always she is late.',
          'She is always late.',
          'She always is late.',
        ],
        answer: 'She is always late.',
      },
    ],
    base_time: 5,
  },
  conditionals: {
    module: 'grammar',
    title: 'Conditional sentences',
    explanation:
      'Zero conditional states facts (if + present, present). First conditional talks about real future possibilities (if + present, will).',
    examples: [
      'If you heat ice, it melts.',
      'If it rains, we will stay home.',
      'If I had time, I would travel more.',
    ],
    common_mistakes: [
      'Using "will" in both clauses of first conditional.',
      'Mixing tenses across conditional types.',
      'Forgetting comma in complex if-clauses.',
    ],
    quick_practice: [
      {
        question: 'If it ___ tomorrow, we will cancel the picnic.',
        options: ['rain', 'rains', 'will rain'],
        answer: 'rains',
      },
    ],
    base_time: 6,
  },
  passive_voice: {
    module: 'grammar',
    title: 'Passive voice',
    explanation:
      'Passive voice focuses on the action or object: be + past participle. Use it when the doer is unknown or less important.',
    examples: [
      'The letter was written yesterday.',
      'English is spoken worldwide.',
      'The cake was eaten by the children.',
    ],
    common_mistakes: [
      'Forgetting "be" (The book written).',
      'Wrong past participle forms.',
      'Overusing passive in informal speech.',
    ],
    quick_practice: [
      {
        question: 'The window ___ by the storm.',
        options: ['broke', 'was broken', 'is break'],
        answer: 'was broken',
      },
    ],
    base_time: 6,
  },
  word_families: {
    module: 'vocabulary',
    title: 'Word families',
    explanation:
      'Word families share a root: act (verb), actor (noun), active (adjective), actively (adverb). Learning families expands vocabulary quickly.',
    examples: [
      'create → creation → creative → creatively',
      'happy → happiness → happily → unhappy',
      'educate → education → educational → educator',
    ],
    common_mistakes: [
      'Using the wrong part of speech (happiness person).',
      'Guessing suffixes without checking meaning.',
      'Ignoring negative prefixes (un-, in-).',
    ],
    quick_practice: [
      {
        question: 'Which word is a noun from the family of "decide"?',
        options: ['decisive', 'decision', 'decidedly'],
        answer: 'decision',
      },
    ],
    base_time: 5,
  },
  collocations: {
    module: 'vocabulary',
    title: 'Common collocations',
    explanation:
      'Collocations are natural word pairs: make a decision (not do a decision), heavy rain, strong coffee. They sound right to native speakers.',
    examples: [
      'make a mistake / make progress',
      'take a photo / take a break',
      'fast food / heavy traffic',
    ],
    common_mistakes: [
      'do a mistake instead of make a mistake.',
      'say strong rain instead of heavy rain.',
      'Translating collocations word-for-word.',
    ],
    quick_practice: [
      {
        question: 'Complete: Please ___ a decision soon.',
        options: ['do', 'make', 'take'],
        answer: 'make',
      },
    ],
    base_time: 5,
  },
  synonyms: {
    module: 'vocabulary',
    title: 'Synonyms and nuance',
    explanation:
      'Synonyms share similar meaning but differ in tone and context. "Big" is neutral; "enormous" is stronger; "substantial" is more formal.',
    examples: [
      'happy → glad, pleased, delighted',
      'sad → unhappy, miserable, down',
      'important → significant, crucial, vital',
    ],
    common_mistakes: [
      'Treating synonyms as always interchangeable.',
      'Using formal synonyms in casual chat.',
      'Ignoring collocations with synonyms.',
    ],
    quick_practice: [
      {
        question: 'Which is closest in meaning to "tiny"?',
        options: ['huge', 'minute', 'wide'],
        answer: 'minute',
      },
    ],
    base_time: 5,
  },
  antonyms: {
    module: 'vocabulary',
    title: 'Antonyms',
    explanation:
      'Antonyms are opposites: hot/cold, increase/decrease. Some words have gradable pairs (warm ↔ cool) and strict pairs (alive ↔ dead).',
    examples: [
      'generous ↔ stingy',
      'ancient ↔ modern',
      'expand ↔ shrink',
    ],
    common_mistakes: [
      'Assuming every word has one perfect opposite.',
      'Confusing antonyms with prefixes only.',
      'Using opposites that change by context.',
    ],
    quick_practice: [
      {
        question: 'What is the opposite of "borrow"?',
        options: ['lend', 'take', 'steal'],
        answer: 'lend',
      },
    ],
    base_time: 4,
  },
  idioms: {
    module: 'vocabulary',
    title: 'Common idioms',
    explanation:
      'Idioms are fixed phrases whose meaning is not literal: "break the ice" means start a conversation, not destroy ice.',
    examples: [
      'Break the ice — start talking in a new group.',
      'Under the weather — feeling unwell.',
      'Piece of cake — something very easy.',
    ],
    common_mistakes: [
      'Translating idioms word-for-word.',
      'Using idioms in very formal writing.',
      'Mixing parts of different idioms.',
    ],
    quick_practice: [
      {
        question: '"Piece of cake" means something is…',
        options: ['delicious', 'easy', 'expensive'],
        answer: 'easy',
      },
    ],
    base_time: 5,
  },
  phrasal_verbs: {
    module: 'vocabulary',
    title: 'Phrasal verbs',
    explanation:
      'Phrasal verbs combine a verb + particle (look up, give up). The particle often changes the meaning completely.',
    examples: [
      'look up — search for information',
      'give up — stop trying',
      'turn down — reject or lower volume',
    ],
    common_mistakes: [
      'Separating inseparable phrasal verbs wrongly.',
      'Confusing similar particles (give in / give up).',
      'Using literal meaning of the verb only.',
    ],
    quick_practice: [
      {
        question: '"Give up" means to…',
        options: ['donate', 'stop trying', 'stand up'],
        answer: 'stop trying',
      },
    ],
    base_time: 6,
  },
  coherence: {
    module: 'writing',
    title: 'Writing coherence',
    explanation:
      'Coherent writing flows logically: each sentence connects to the next. Use consistent pronouns, clear topics, and logical order.',
    examples: [
      'First, outline your main idea. Then add supporting details.',
      'Repeat key terms instead of switching synonyms too often.',
      'End paragraphs with a link to the next point.',
    ],
    common_mistakes: [
      'Jumping between unrelated ideas.',
      'Unclear pronoun references (they, it).',
      'Missing topic sentences in paragraphs.',
    ],
    quick_practice: [
      {
        question: 'What improves coherence most?',
        options: [
          'Random vocabulary',
          'Clear logical order',
          'Very long sentences',
        ],
        answer: 'Clear logical order',
      },
    ],
    base_time: 5,
  },
  linking_words: {
    module: 'writing',
    title: 'Linking words',
    explanation:
      'Linking words show relationships: however (contrast), therefore (result), moreover (addition), for example (illustration).',
    examples: [
      'I was tired; however, I finished the essay.',
      'The data is limited. Therefore, we need more research.',
      'Moreover, the plan saves time.',
    ],
    common_mistakes: [
      'Overusing "but" and "and" only.',
      'Wrong linker for the relationship.',
      'Comma splices with however.',
    ],
    quick_practice: [
      {
        question: 'Choose the best linker: It rained; ___, we stayed inside.',
        options: ['however', 'therefore', 'moreover'],
        answer: 'therefore',
      },
    ],
    base_time: 5,
  },
  punctuation: {
    module: 'writing',
    title: 'Punctuation essentials',
    explanation:
      'Commas separate items and clauses. Apostrophes show possession (Maria\'s book) or contractions (don\'t). Full stops end statements.',
    examples: [
      'She bought apples, oranges, and bananas.',
      'It\'s raining — contraction of "it is".',
      'After the meeting, we left early.',
    ],
    common_mistakes: [
      'Its vs it\'s confusion.',
      'Missing comma after introductory phrases.',
      'Run-on sentences without punctuation.',
    ],
    quick_practice: [
      {
        question: 'Which is correct?',
        options: ["Its a good day.", "It's a good day.", 'Its\' a good day.'],
        answer: "It's a good day.",
      },
    ],
    base_time: 4,
  },
  pronunciation_patterns: {
    module: 'speaking',
    title: 'Pronunciation patterns',
    explanation:
      'English sounds differ from spelling. Silent letters (knight), vowel reductions (to → /tə/), and word stress change meaning and clarity.',
    examples: [
      'Photograph vs photography — stress shifts.',
      'ed endings: /t/, /d/, or /ɪd/ depending on the sound before.',
      'th in think vs this — voiceless vs voiced.',
    ],
    common_mistakes: [
      'Pronouncing every letter literally.',
      'Flat stress on all syllables.',
      'Confusing similar vowels (ship / sheep).',
    ],
    quick_practice: [
      {
        question: 'Which syllable is stressed in PHOtograph?',
        options: ['PHO', 'to', 'graph'],
        answer: 'PHO',
      },
    ],
    base_time: 6,
  },
  stress_patterns: {
    module: 'speaking',
    title: 'Word and sentence stress',
    explanation:
      'Stressed syllables are louder and longer. In sentences, content words (nouns, main verbs) are usually stressed; function words are reduced.',
    examples: [
      'REcord (noun) vs reCORD (verb).',
      'I WANT to GO HOME — key words stressed.',
      'She\'s a DOCtor — job title stressed.',
    ],
    common_mistakes: [
      'Equal stress on every syllable.',
      'Stressing function words too strongly.',
      'Wrong stress changing word class.',
    ],
    quick_practice: [
      {
        question: 'In sentences, which words are usually stressed?',
        options: ['articles', 'content words', 'prepositions only'],
        answer: 'content words',
      },
    ],
    base_time: 5,
  },
  fluency_tips: {
    module: 'speaking',
    title: 'Fluency tips',
    explanation:
      'Fluency is smooth, understandable speech — not perfect grammar. Use fillers sparingly, chunk phrases, and pause at natural breaks.',
    examples: [
      'Chunk: "as a matter of fact" as one unit.',
      'Self-correct briefly: "I mean…" then continue.',
      'Slow down on key points, not every word.',
    ],
    common_mistakes: [
      'Stopping after every word.',
      'Avoiding speaking until perfect.',
      'Too many fillers (um, uh, like).',
    ],
    quick_practice: [
      {
        question: 'Fluency means speech is…',
        options: ['perfect grammar', 'smooth and clear', 'very fast'],
        answer: 'smooth and clear',
      },
    ],
    base_time: 5,
  },
};

const CONCEPT_ALIASES: Record<string, string> = {
  article: 'articles',
  articles: 'articles',
  present_simple: 'tenses',
  past_simple: 'tenses',
  verb_tense: 'tenses',
  tenses: 'tenses',
  preposition: 'prepositions',
  prepositions: 'prepositions',
  'subject-verb agreement': 'subject_verb_agreement',
  subject_verb_agreement: 'subject_verb_agreement',
  modal: 'modals',
  modals: 'modals',
  word_order: 'word_order',
  conditional: 'conditionals',
  conditionals: 'conditionals',
  passive: 'passive_voice',
  passive_voice: 'passive_voice',
  word_families: 'word_families',
  collocation: 'collocations',
  collocations: 'collocations',
  synonym: 'synonyms',
  synonyms: 'synonyms',
  antonym: 'antonyms',
  antonyms: 'antonyms',
  idiom: 'idioms',
  idioms: 'idioms',
  phrasal_verb: 'phrasal_verbs',
  phrasal_verbs: 'phrasal_verbs',
  coherence: 'coherence',
  linking_words: 'linking_words',
  punctuation: 'punctuation',
  pronunciation: 'pronunciation_patterns',
  pronunciation_patterns: 'pronunciation_patterns',
  stress: 'stress_patterns',
  stress_patterns: 'stress_patterns',
  fluency: 'fluency_tips',
  fluency_tips: 'fluency_tips',
  fluency_pattern: 'fluency_tips',
};

const MODULE_CONCEPTS: Record<MiniLessonModule, string[]> = {
  grammar: [
    'articles',
    'tenses',
    'prepositions',
    'subject_verb_agreement',
    'modals',
    'word_order',
    'conditionals',
    'passive_voice',
  ],
  vocabulary: [
    'word_families',
    'collocations',
    'synonyms',
    'antonyms',
    'idioms',
    'phrasal_verbs',
  ],
  writing: ['coherence', 'linking_words', 'punctuation'],
  speaking: ['pronunciation_patterns', 'stress_patterns', 'fluency_tips'],
};

export function normalizeConcept(concept: string): string {
  const key = concept.trim().toLowerCase().replace(/\s+/g, '_');
  return CONCEPT_ALIASES[key] ?? key;
}

export function getConceptsForModule(module: MiniLessonModule): string[] {
  return MODULE_CONCEPTS[module] ?? [];
}

export function resolveModuleForConcept(concept: string): MiniLessonModule {
  const normalized = normalizeConcept(concept);
  const template = LESSON_TEMPLATES[normalized];
  if (template) {
    return template.module;
  }

  for (const [module, concepts] of Object.entries(MODULE_CONCEPTS)) {
    if (concepts.includes(normalized)) {
      return module as MiniLessonModule;
    }
  }

  return 'grammar';
}

function clampDifficulty(level: number): number {
  if (!Number.isFinite(level)) return 2;
  return Math.min(5, Math.max(1, Math.round(level)));
}

function scaleTemplate(
  template: LessonTemplate,
  concept: string,
  difficulty: number,
): MiniLesson {
  const exampleCount = difficulty <= 2 ? 2 : template.examples.length;
  const practiceCount = difficulty <= 2 ? 1 : template.quick_practice.length;

  return {
    id: `${template.module}:${concept}`,
    concept,
    module: template.module,
    difficulty_level: difficulty,
    title: template.title,
    explanation: template.explanation,
    examples: template.examples.slice(0, exampleCount),
    common_mistakes: template.common_mistakes.slice(0, exampleCount),
    quick_practice: template.quick_practice.slice(0, practiceCount),
    estimated_time: template.base_time + Math.max(0, difficulty - 2),
  };
}

export function generateLesson(
  concept: string,
  difficultyLevel = 2,
  moduleHint?: MiniLessonModule,
): MiniLesson {
  const normalized = normalizeConcept(concept);
  const difficulty = clampDifficulty(difficultyLevel);
  const template =
    LESSON_TEMPLATES[normalized] ??
    LESSON_TEMPLATES.articles;

  const resolvedConcept =
    LESSON_TEMPLATES[normalized] !== undefined
      ? normalized
      : moduleHint && MODULE_CONCEPTS[moduleHint]?.[0]
        ? MODULE_CONCEPTS[moduleHint][0]
        : 'articles';

  const resolvedTemplate =
    LESSON_TEMPLATES[resolvedConcept] ?? LESSON_TEMPLATES.articles;

  return scaleTemplate(resolvedTemplate, resolvedConcept, difficulty);
}

export function listAllLessonConcepts(): string[] {
  return Object.keys(LESSON_TEMPLATES);
}
