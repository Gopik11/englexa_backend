import { LearnerLevel } from './englexa-content-spec.constants';

export type QuoteCategory =
  | 'motivational'
  | 'philosophical'
  | 'learning_mindset'
  | 'growth_mindset';

export interface WordOfTheDaySeed {
  word: string;
  meaning: string;
  example: string;
  synonyms: string[];
  antonyms: string[];
  pronunciation: string;
  mini_tip: string;
  micro_lesson: string;
}

export interface QuoteSeed {
  quote: string;
  category: QuoteCategory;
  explanation: string;
}

export interface CrosswordTemplate {
  grid: string[][];
  clues: {
    across: Record<string, string>;
    down: Record<string, string>;
  };
}

export const WORDS_BY_LEVEL: Record<LearnerLevel, WordOfTheDaySeed[]> = {
  beginner: [
    {
      word: 'greet',
      meaning: 'To say hello to someone in a friendly way.',
      example: 'I greet my neighbours every morning.',
      synonyms: ['welcome', 'salute', 'say hello'],
      antonyms: ['ignore', 'avoid'],
      pronunciation: '/ɡriːt/',
      mini_tip: 'Think: greet = great start to a conversation.',
      micro_lesson:
        'Use "greet" when you meet someone and want to be polite. ' +
        'It matters because a simple greeting builds connection. ' +
        'Say it at the start of a conversation, not when leaving. ' +
        'Example: "She greets every guest with a smile." ' +
        'Try greeting someone in English today.',
    },
    {
      word: 'bright',
      meaning: 'Full of light; also clever or cheerful.',
      example: 'The room is bright and sunny.',
      synonyms: ['luminous', 'clever', 'cheerful'],
      antonyms: ['dark', 'dim', 'dull'],
      pronunciation: '/braɪt/',
      mini_tip: 'Bright = light OR smart — context tells you which.',
      micro_lesson:
        '"Bright" describes strong light or a sharp mind. ' +
        'It helps you paint vivid pictures in speech. ' +
        'Use it for rooms, days, ideas, or people. ' +
        'Do not use it for loud sounds — that is "loud". ' +
        'Practice: "What bright thing did you see today?"',
    },
    {
      word: 'journey',
      meaning: 'A trip from one place to another.',
      example: 'Our journey to school takes twenty minutes.',
      synonyms: ['trip', 'travel', 'voyage'],
      antonyms: ['stay', 'rest'],
      pronunciation: '/ˈdʒɜːrni/',
      mini_tip: 'Journey = the travel itself, not just the destination.',
      micro_lesson:
        'A journey is the whole experience of going somewhere. ' +
        'It matters when telling stories about travel or learning. ' +
        'Use it for physical trips or life changes ("learning journey"). ' +
        'It does not mean a very short walk across a room. ' +
        'Try: "Describe a short journey you took this week."',
    },
    {
      word: 'helpful',
      meaning: 'Giving or ready to give help.',
      example: 'The shop assistant was very helpful.',
      synonyms: ['useful', 'supportive', 'kind'],
      antonyms: ['unhelpful', 'useless'],
      pronunciation: '/ˈhelpfl/',
      mini_tip: 'Helpful people make tasks easier — be one!',
      micro_lesson:
        '"Helpful" describes people or things that make life easier. ' +
        'It builds positive relationships in daily English. ' +
        'Use it after someone assists you or when reviewing tools. ' +
        'It does not describe something harmful or confusing. ' +
        'Say thank you with: "That was really helpful."',
    },
    {
      word: 'quiet',
      meaning: 'Making little or no noise.',
      example: 'Please be quiet in the library.',
      synonyms: ['silent', 'calm', 'peaceful'],
      antonyms: ['loud', 'noisy'],
      pronunciation: '/ˈkwaɪət/',
      mini_tip: 'Quiet has a soft "qu-" — like a whisper.',
      micro_lesson:
        '"Quiet" describes low noise levels. ' +
        'It is essential for classrooms, libraries, and focus. ' +
        'Use it for places, people, or moments. ' +
        'It does not mean boring — a quiet sunset can be beautiful. ' +
        'Practice: "When do you prefer a quiet environment?"',
    },
  ],
  intermediate: [
    {
      word: 'resilient',
      meaning: 'Able to recover quickly from difficulties.',
      example: 'She is resilient after setbacks at work.',
      synonyms: ['tough', 'adaptable', 'strong'],
      antonyms: ['fragile', 'vulnerable'],
      pronunciation: '/rɪˈzɪliənt/',
      mini_tip: 'Resilient = bounce back like a rubber ball.',
      micro_lesson:
        'Resilience means recovering after stress or failure. ' +
        'It matters in professional and academic English. ' +
        'Use it for people, teams, or economies. ' +
        'It does not mean never feeling pain — it means recovering. ' +
        'Reflect: "What helped you stay resilient last month?"',
    },
    {
      word: 'ambiguous',
      meaning: 'Open to more than one interpretation; unclear.',
      example: 'His email was ambiguous about the deadline.',
      synonyms: ['unclear', 'vague', 'equivocal'],
      antonyms: ['clear', 'explicit', 'precise'],
      pronunciation: '/æmˈbɪɡjuəs/',
      mini_tip: 'Ambi- = both ways — meaning goes two directions.',
      micro_lesson:
        '"Ambiguous" signals unclear communication. ' +
        'Spotting ambiguity prevents misunderstandings at work. ' +
        'Use it for instructions, signs, or statements. ' +
        'It does not mean wrong — just open to multiple readings. ' +
        'Ask: "Can you rewrite this without being ambiguous?"',
    },
    {
      word: 'collaborate',
      meaning: 'To work jointly with others on a project.',
      example: 'We collaborate with designers on the campaign.',
      synonyms: ['cooperate', 'partner', 'team up'],
      antonyms: ['compete', 'work alone'],
      pronunciation: '/kəˈlæbəreɪt/',
      mini_tip: 'Co + labor = labour together.',
      micro_lesson:
        'Collaboration is shared effort toward one goal. ' +
        'Modern workplaces value this verb highly. ' +
        'Use it with "with" + people or teams. ' +
        'It does not mean delegating everything away. ' +
        'Try: "Who do you collaborate with most often?"',
    },
    {
      word: 'persuade',
      meaning: 'To cause someone to believe or do something through reasoning.',
      example: 'She persuaded the team to try a new approach.',
      synonyms: ['convince', 'influence', 'win over'],
      antonyms: ['dissuade', 'discourage'],
      pronunciation: '/pərˈsweɪd/',
      mini_tip: 'Persuade = sweet talk with solid reasons.',
      micro_lesson:
        'Persuasion uses logic, emotion, or evidence. ' +
        'It appears in debates, sales, and leadership. ' +
        'Structure: persuade + someone + to + verb. ' +
        'It does not mean forcing — that is "coerce". ' +
        'Practice persuading a friend to join a hobby.',
    },
    {
      word: 'meticulous',
      meaning: 'Showing great attention to detail; very careful.',
      example: 'He keeps meticulous notes during meetings.',
      synonyms: ['thorough', 'precise', 'careful'],
      antonyms: ['careless', 'sloppy'],
      pronunciation: '/məˈtɪkjələs/',
      mini_tip: 'Meta + iculous = every tiny detail counts.',
      micro_lesson:
        'Meticulous work reduces errors and builds trust. ' +
        'Employers love this trait in writing and analysis. ' +
        'Use it for people, plans, or records. ' +
        'It does not mean slow for no reason — it means careful. ' +
        'Describe a task where being meticulous helped you.',
    },
  ],
  advanced: [
    {
      word: 'ephemeral',
      meaning: 'Lasting for a very short time.',
      example: 'Trends on social media can be ephemeral.',
      synonyms: ['fleeting', 'transient', 'momentary'],
      antonyms: ['permanent', 'enduring', 'lasting'],
      pronunciation: '/ɪˈfemərəl/',
      mini_tip: 'Ephemeral = here today, gone tomorrow.',
      micro_lesson:
        'Ephemeral captures the idea of brief existence. ' +
        'It enriches essays on nature, art, and technology. ' +
        'Use it for beauty, fame, or emotions. ' +
        'It does not describe something that returns every season. ' +
        'Write one sentence about an ephemeral moment you noticed.',
    },
    {
      word: 'paradigm',
      meaning: 'A typical example or pattern of something; a worldview.',
      example: 'Remote work shifted the paradigm of office culture.',
      synonyms: ['model', 'framework', 'pattern'],
      antonyms: ['anomaly', 'exception'],
      pronunciation: '/ˈpærədaɪm/',
      mini_tip: 'Paradigm shift = the rules of the game changed.',
      micro_lesson:
        'A paradigm is a lens through which we see problems. ' +
        'Academic and business English use it for big changes. ' +
        'Use it when discussing theory or industry transformation. ' +
        'It does not mean a single statistic — it is a whole model. ' +
        'Debate: "What paradigm shift is happening in education?"',
    },
    {
      word: 'ubiquitous',
      meaning: 'Present, appearing, or found everywhere.',
      example: 'Smartphones are ubiquitous in urban life.',
      synonyms: ['omnipresent', 'pervasive', 'everywhere'],
      antonyms: ['rare', 'scarce', 'uncommon'],
      pronunciation: '/juːˈbɪkwɪtəs/',
      mini_tip: 'Ubi = everywhere — like Wi‑Fi signals in a city.',
      micro_lesson:
        '"Ubiquitous" stresses how common something has become. ' +
        'It suits technology and culture essays. ' +
        'Use it for devices, phrases, or habits. ' +
        'It does not mean universally liked — only widely present. ' +
        'List three ubiquitous items in your daily routine.',
    },
    {
      word: 'pragmatic',
      meaning: 'Dealing with things sensibly and realistically.',
      example: 'We need a pragmatic plan, not a perfect one.',
      synonyms: ['practical', 'realistic', 'sensible'],
      antonyms: ['idealistic', 'impractical'],
      pronunciation: '/præɡˈmætɪk/',
      mini_tip: 'Pragmatic = what works beats what sounds fancy.',
      micro_lesson:
        'Pragmatism favours workable solutions over ideals. ' +
        'Leaders and negotiators rely on this mindset. ' +
        'Use it for decisions, policies, or people. ' +
        'It does not mean cynical — it means practical. ' +
        'When did you choose a pragmatic compromise?',
    },
    {
      word: 'eloquent',
      meaning: 'Fluent and persuasive in speaking or writing.',
      example: 'Her eloquent speech moved the audience.',
      synonyms: ['articulate', 'expressive', 'persuasive'],
      antonyms: ['inarticulate', 'awkward'],
      pronunciation: '/ˈeləkwənt/',
      mini_tip: 'Eloquent = your words flow and land with impact.',
      micro_lesson:
        'Eloquence combines clarity, rhythm, and emotion. ' +
        'It marks strong presenters and writers. ' +
        'Use it for speeches, essays, or replies. ' +
        'It does not mean using rare words nobody understands. ' +
        'Listen for an eloquent speaker and note one technique they use.',
    },
  ],
};

export const QUOTE_SEEDS: QuoteSeed[] = [
  {
    quote: 'The expert in anything was once a beginner.',
    category: 'learning_mindset',
    explanation:
      'Every skill starts with small steps. This quote reminds you that practice—not perfection—is the path forward.',
  },
  {
    quote: 'We are what we repeatedly do. Excellence, then, is not an act, but a habit.',
    category: 'philosophical',
    explanation:
      'Aristotle’s idea applies to language learning: daily practice shapes fluency more than occasional bursts.',
  },
  {
    quote: 'Small daily improvements are the key to staggering long-term results.',
    category: 'growth_mindset',
    explanation:
      'Ten minutes of English today beats two hours once a month. Consistency compounds.',
  },
  {
    quote: 'The only way to do great work is to love what you learn.',
    category: 'motivational',
    explanation:
      'Curiosity fuels persistence. When you enjoy vocabulary or stories, study feels lighter.',
  },
  {
    quote: 'Knowing yourself is the beginning of all wisdom.',
    category: 'philosophical',
    explanation:
      'Reflect on how you learn best—reading, speaking, or puzzles—and build habits around your strengths.',
  },
  {
    quote: 'Mistakes are proof that you are trying.',
    category: 'learning_mindset',
    explanation:
      'Every error is data. Correct it, remember the pattern, and move on without shame.',
  },
  {
    quote: 'Growth begins at the end of your comfort zone.',
    category: 'growth_mindset',
    explanation:
      'Try one harder exercise or conversation each week. Discomfort signals progress.',
  },
  {
    quote: 'Energy and persistence conquer all things.',
    category: 'motivational',
    explanation:
      'Streaks and XP reward showing up. Keep your rhythm even on busy days.',
  },
  {
    quote: 'The mind is not a vessel to be filled, but a fire to be kindled.',
    category: 'philosophical',
    explanation:
      'Engage actively—ask questions, play with words, and teach others what you learn.',
  },
  {
    quote: 'Success is the sum of small efforts, repeated day in and day out.',
    category: 'motivational',
    explanation:
      'Word of the day, a puzzle, one lesson—each chip adds up to fluency.',
  },
];

export const CROSSWORDS_BY_LEVEL: Record<LearnerLevel, CrosswordTemplate[]> = {
  beginner: [
    {
      grid: [
        ['C', 'A', 'T', ''],
        ['A', '', '', ''],
        ['R', '', '', ''],
        ['', '', '', ''],
      ],
      clues: {
        across: { '1': 'A small pet that says meow (3 letters)' },
        down: { '1': 'A vehicle with four wheels (3 letters)' },
      },
    },
    {
      grid: [
        ['S', 'U', 'N', ''],
        ['K', '', '', ''],
        ['Y', '', '', ''],
        ['', '', '', ''],
      ],
      clues: {
        across: { '1': 'The star that gives us light (3 letters)' },
        down: { '1': 'Opposite of slow (3 letters, informal)' },
      },
    },
  ],
  intermediate: [
    {
      grid: [
        ['T', 'I', 'M', 'E'],
        ['O', '', '', ''],
        ['P', '', '', ''],
        ['', '', '', ''],
      ],
      clues: {
        across: { '1': 'What clocks measure (4 letters)' },
        down: { '1': 'Highest point; summit (3 letters)' },
      },
    },
    {
      grid: [
        ['G', 'O', 'A', 'L'],
        ['O', '', '', 'O'],
        ['O', '', '', 'O'],
        ['D', '', '', 'D'],
      ],
      clues: {
        across: { '1': 'Something you aim to achieve (4 letters)' },
        down: { '1': 'Positive or pleasant (4 letters)' },
      },
    },
  ],
  advanced: [
    {
      grid: [
        ['L', 'O', 'G', 'I', 'C'],
        ['E', '', '', '', ''],
        ['A', '', '', '', ''],
        ['R', '', '', '', ''],
        ['N', '', '', '', ''],
      ],
      clues: {
        across: { '1': 'Reasoned thinking (5 letters)' },
        down: { '1': 'To gain knowledge (5 letters)' },
      },
    },
    {
      grid: [
        ['F', 'O', 'C', 'U', 'S'],
        ['L', '', '', '', ''],
        ['U', '', '', '', ''],
        ['E', '', '', '', ''],
        ['N', '', '', '', ''],
      ],
      clues: {
        across: { '1': 'Concentrated attention (5 letters)' },
        down: { '1': 'Fluent language ability (5 letters)' },
      },
    },
  ],
};
