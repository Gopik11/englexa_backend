import { LearnerLevel } from './englexa-content-spec.constants';
import { WritingTopic } from '../writing-practice/interfaces/writing-prompt.interface';

export interface WritingPromptBlueprint {
  title: string;
  prompt: string;
  word_limit: number;
  example_outline: string[];
}

type LevelSeeds = Partial<Record<LearnerLevel, WritingPromptBlueprint[]>>;

export const DEFAULT_WRITING_AI_TOPIC: WritingTopic = 'personal_paragraph';

/** Beginner: short paragraphs (5–6 sentences). */
const BEGINNER_PERSONAL: WritingPromptBlueprint[] = [
  {
    title: 'About me',
    prompt:
      'Write a short paragraph of 5–6 sentences about yourself. Include your name, where you live, one hobby, and one thing you like about your daily life.',
    word_limit: 80,
    example_outline: [
      'Greeting and your name',
      'Where you live',
      'Your job or studies',
      'One hobby you enjoy',
      'Why you like it',
      'A short closing sentence',
    ],
  },
  {
    title: 'My family',
    prompt:
      'Write 5–6 sentences describing your family. Say who you live with and one tradition you enjoy together.',
    word_limit: 75,
    example_outline: [
      'Introduce your family',
      'Who you live with',
      'One family member you are close to',
      'A typical weekend activity',
      'Why family time matters to you',
      'Closing thought',
    ],
  },
  {
    title: 'A typical day',
    prompt:
      'Describe a typical day in 5–6 simple sentences. Mention morning, afternoon, and evening.',
    word_limit: 85,
    example_outline: [
      'When you wake up',
      'Morning routine',
      'Work or school activity',
      'Something you do in the afternoon',
      'Evening habit',
      'How you feel at the end of the day',
    ],
  },
];

const BEGINNER_EMAIL: WritingPromptBlueprint[] = [
  {
    title: 'Study invitation',
    prompt:
      'Write a short email in 5–6 sentences inviting a classmate to study together after school.',
    word_limit: 90,
    example_outline: [
      'Greeting',
      'Reason for writing',
      'Suggested time and place',
      'What you will study',
      'Friendly closing',
      'Sign-off',
    ],
  },
];

/** Intermediate: opinion paragraphs. */
const INTERMEDIATE_OPINION: WritingPromptBlueprint[] = [
  {
    title: 'City or countryside',
    prompt:
      'Write an opinion paragraph on whether it is better to live in a city or the countryside. State your view and support it with two reasons.',
    word_limit: 130,
    example_outline: [
      'State your opinion clearly',
      'First reason with explanation',
      'Second reason with example',
      'Acknowledge the other side briefly',
      'Concluding sentence',
    ],
  },
  {
    title: 'Online learning',
    prompt:
      'Give your opinion on whether online learning is as effective as classroom learning. Use clear supporting points.',
    word_limit: 140,
    example_outline: [
      'Opening opinion',
      'Main advantage or disadvantage',
      'Second supporting point',
      'Personal or general example',
      'Final opinion',
    ],
  },
  {
    title: 'Healthy habits',
    prompt:
      'Write an opinion paragraph about one habit that helps people stay healthy. Explain why you recommend it.',
    word_limit: 120,
    example_outline: [
      'Name the habit',
      'Why it is important',
      'How it helps the body or mind',
      'Example from daily life',
      'Encouraging conclusion',
    ],
  },
];

const INTERMEDIATE_STORY: WritingPromptBlueprint[] = [
  {
    title: 'An unexpected event',
    prompt:
      'Write a short story paragraph with a clear beginning, middle, and end about an unexpected event during your day.',
    word_limit: 140,
    example_outline: [
      'Set the scene',
      'What you expected',
      'The unexpected event',
      'How you reacted',
      'How it ended',
    ],
  },
];

/** Advanced: argumentative and problem-solution tasks. */
const ADVANCED_ARGUMENT: WritingPromptBlueprint[] = [
  {
    title: 'Remote work policy',
    prompt:
      'Write an argumentative paragraph: should companies require employees to return to the office? Take a clear position and refute one counterargument.',
    word_limit: 200,
    example_outline: [
      'Thesis statement',
      'Main argument with evidence',
      'Second supporting point',
      'Counterargument',
      'Rebuttal',
      'Conclusion',
    ],
  },
  {
    title: 'Technology in schools',
    prompt:
      'Argue whether technology improves learning outcomes in schools. Support your position with two strong reasons.',
    word_limit: 210,
    example_outline: [
      'Clear position',
      'Academic or practical benefit',
      'Second reason',
      'Limitation or risk',
      'Why your position still holds',
      'Closing statement',
    ],
  },
];

const ADVANCED_PROBLEM_SOLUTION: WritingPromptBlueprint[] = [
  {
    title: 'Urban traffic',
    prompt:
      'Write a problem-solution paragraph about traffic congestion in large cities. Describe the problem and propose one practical solution.',
    word_limit: 190,
    example_outline: [
      'Describe the problem',
      'Who is affected',
      'Why the problem is serious',
      'Proposed solution',
      'Expected benefit',
      'Brief conclusion',
    ],
  },
  {
    title: 'Plastic waste',
    prompt:
      'Write a problem-solution paragraph about plastic waste in communities. Explain the issue and recommend a realistic policy or habit change.',
    word_limit: 200,
    example_outline: [
      'Introduce the problem',
      'Main cause',
      'Impact on people or environment',
      'Recommended solution',
      'How it would work',
      'Final recommendation',
    ],
  },
];

export const WRITING_LEVEL_FALLBACK_BLUEPRINTS: Record<
  LearnerLevel,
  WritingPromptBlueprint[]
> = {
  beginner: BEGINNER_PERSONAL,
  intermediate: INTERMEDIATE_OPINION,
  advanced: [...ADVANCED_ARGUMENT, ...ADVANCED_PROBLEM_SOLUTION],
};

export const WRITING_PROMPT_BLUEPRINTS: Record<WritingTopic, LevelSeeds> = {
  personal_paragraph: {
    beginner: BEGINNER_PERSONAL,
    intermediate: [],
    advanced: [],
  },
  short_email: {
    beginner: BEGINNER_EMAIL,
    intermediate: [],
    advanced: [],
  },
  opinion_paragraph: {
    beginner: [],
    intermediate: INTERMEDIATE_OPINION,
    advanced: [],
  },
  story_paragraph: {
    beginner: [],
    intermediate: INTERMEDIATE_STORY,
    advanced: [],
  },
  argumentative_essay: {
    beginner: [],
    intermediate: [],
    advanced: ADVANCED_ARGUMENT,
  },
  formal_summary: {
    beginner: [],
    intermediate: [],
    advanced: ADVANCED_PROBLEM_SOLUTION,
  },
};
