import { ConceptMastery } from '../../mastery/entities/concept-mastery.entity';
import { LearnerLevel } from '../../content/englexa-content-spec.constants';
import { dailySeed, pickDailyIndex, todayUtcKey } from '../../home/utils/daily-seed';
import { MiniLesson } from '../../mini-lessons/entities/mini-lesson.entity';
import { SrsDueItem } from '../../srs/entities/srs.entity';
import { ConceptPrediction } from '../../prediction/entities/prediction.entity';

export interface WeeklyPlanExercise {
  concept?: string;
  exercise?: string;
  word?: string;
  passage?: string;
  questions?: string[];
  prompt?: string;
  task?: string;
}

export interface WeeklyPlan {
  week_start: string;
  grammar: WeeklyPlanExercise[];
  vocabulary: WeeklyPlanExercise[];
  reading: WeeklyPlanExercise[];
  speaking: WeeklyPlanExercise[];
  writing: WeeklyPlanExercise[];
  goals: string[];
  motivation: string;
  mini_lessons?: MiniLesson[];
  srs_items?: SrsDueItem[];
  predictions?: ConceptPrediction[];
}

const VOCAB_WORDS: Record<LearnerLevel, string[]> = {
  beginner: [
    'greet', 'friend', 'happy', 'learn', 'study', 'family', 'school', 'water',
    'food', 'travel', 'weather', 'music', 'book', 'write', 'speak', 'listen',
    'answer', 'question', 'morning', 'evening',
  ],
  intermediate: [
    'resilient', 'collaborate', 'persuade', 'ambiguous', 'concise', 'diligent',
    'empathy', 'innovate', 'negotiate', 'prioritize', 'relevant', 'strategy',
    'transform', 'validate', 'warranty', 'yield', 'zealous', 'articulate',
    'benchmark', 'catalyst',
  ],
  advanced: [
    'ephemeral', 'juxtapose', 'quintessential', 'serendipity', 'ubiquitous',
    'verisimilitude', 'wane', 'xenophobia', 'yonder', 'zealot', 'abstruse',
    'capricious', 'deleterious', 'fastidious', 'gregarious', 'heuristic',
    'iconoclast', 'juxtaposition', 'kaleidoscope', 'labyrinthine',
  ],
};

const GRAMMAR_CONCEPTS = [
  'articles',
  'present_simple',
  'past_simple',
  'prepositions',
  'modals',
  'conditionals',
];

const READING_PASSAGES: Record<LearnerLevel, string> = {
  beginner:
    'Maria walks to school every morning. She greets her friends and learns new English words in class.',
  intermediate:
    'Effective learners review mistakes and practise deliberately. Small daily habits compound into fluency over time.',
  advanced:
    'Critical reading requires evaluating an author\'s assumptions, weighing evidence, and synthesising ideas across paragraphs.',
};

const SPEAKING_PROMPTS = [
  'Describe your favourite place in 30 seconds.',
  'Explain how you learn new vocabulary.',
  'Talk about a goal you are working toward.',
  'Describe your daily routine.',
];

const WRITING_TASKS: Record<LearnerLevel, string> = {
  beginner: 'Write 3–4 sentences about your family.',
  intermediate: 'Write a short paragraph about a skill you want to improve.',
  advanced:
    'Write a structured paragraph arguing for or against daily language practice.',
};

export function generateWeeklyPlan(
  userId: string,
  level: LearnerLevel,
  weakConcepts: ConceptMastery[],
): WeeklyPlan {
  const weekStart = todayUtcKey();
  const seed = dailySeed(userId, `weekly-plan:${weekStart}`);

  const weakGrammar = weakConcepts
    .filter((item) => item.module === 'grammar')
    .slice(0, 3)
    .map((item) => item.concept);

  const grammarConcepts =
    weakGrammar.length >= 3
      ? weakGrammar
      : [
          ...weakGrammar,
          ...GRAMMAR_CONCEPTS.filter((c) => !weakGrammar.includes(c)),
        ].slice(0, 3);

  const vocabPool = VOCAB_WORDS[level];
  const vocabStart = pickDailyIndex(userId, 'weekly-vocab', vocabPool.length);
  const vocabulary = Array.from({ length: 20 }, (_, index) => {
    const word = vocabPool[(vocabStart + index) % vocabPool.length];
    return {
      word,
      exercise: `Learn and use "${word}" in a sentence.`,
    };
  });

  const goals = [
    `Practise ${grammarConcepts[0]?.replace(/_/g, ' ') ?? 'grammar'} 3 times this week`,
    'Learn 20 new vocabulary words',
    'Complete 1 reading passage',
    'Record 2 speaking prompts',
    'Submit 1 writing task',
  ];

  const motivation = pickMotivation(userId);

  return {
    week_start: weekStart,
    grammar: grammarConcepts.map((concept) => ({
      concept,
      exercise: `Complete 5 ${concept.replace(/_/g, ' ')} exercises.`,
    })),
    vocabulary,
    reading: [
      {
        passage: READING_PASSAGES[level],
        questions: [
          'What is the main idea?',
          'Which detail supports the theme?',
          'What vocabulary did you learn?',
        ],
      },
    ],
    speaking: SPEAKING_PROMPTS.slice(0, 2).map((prompt) => ({ prompt })),
    writing: [{ task: WRITING_TASKS[level] }],
    goals,
    motivation,
  };
}

function pickMotivation(userId: string): string {
  const messages = [
    'Consistency beats intensity — fifteen minutes a day adds up.',
    'Every mistake is data. Review it, then move forward.',
    'Fluency grows at the edge of comfort. Stretch yourself this week.',
    'You are building habits that will outlast any single lesson.',
    'Focus on one weak area this week and watch it transform.',
  ];
  return messages[pickDailyIndex(userId, 'weekly-motivation', messages.length)];
}
