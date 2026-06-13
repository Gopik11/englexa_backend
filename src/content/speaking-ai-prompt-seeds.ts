import { LearnerLevel } from './englexa-content-spec.constants';
import { SpeakingTopic } from '../speaking-practice/interfaces/speaking-prompt.interface';

export interface SpeakingPromptBlueprint {
  prompt: string;
  example_answer: string;
}

type LevelSeeds = Partial<Record<LearnerLevel, SpeakingPromptBlueprint[]>>;

export const DEFAULT_SPEAKING_AI_TOPIC: SpeakingTopic = 'self_introduction';

/** Beginner: simple personal questions. */
const BEGINNER_PERSONAL: SpeakingPromptBlueprint[] = [
  {
    prompt: 'What is your name?',
    example_answer: 'My name is Maria.',
  },
  {
    prompt: 'Where are you from?',
    example_answer: 'I am from Brazil.',
  },
  {
    prompt: 'How old are you?',
    example_answer: 'I am twenty-four years old.',
  },
  {
    prompt: 'What do you do?',
    example_answer: 'I am a student at a language school.',
  },
  {
    prompt: 'Who do you live with?',
    example_answer: 'I live with my parents and my younger brother.',
  },
];

/** Intermediate: daily life and opinions. */
const INTERMEDIATE_DAILY: SpeakingPromptBlueprint[] = [
  {
    prompt: 'Describe a typical weekday for you.',
    example_answer:
      'On weekdays I wake up early, go to work, and usually cook dinner at home.',
  },
  {
    prompt: 'What do you usually do to relax after a busy day?',
    example_answer:
      'After a busy day, I listen to music and take a short walk in my neighbourhood.',
  },
  {
    prompt: 'Do you prefer cooking at home or eating out? Why?',
    example_answer:
      'I prefer cooking at home because it is cheaper and I can choose healthier food.',
  },
];

const INTERMEDIATE_OPINIONS: SpeakingPromptBlueprint[] = [
  {
    prompt: 'Do you think public transport in your city is good? Explain your view.',
    example_answer:
      'In my opinion, public transport is convenient, but it is often crowded during rush hour.',
  },
  {
    prompt: 'Is it better to work from home or in an office? Give your opinion.',
    example_answer:
      'I think working from home is flexible, but the office helps me focus and collaborate.',
  },
  {
    prompt: 'Should schools give more homework? Share your opinion.',
    example_answer:
      'I believe schools should give less homework so students have more time to rest and explore hobbies.',
  },
];

/** Advanced: abstract topics and arguments. */
const ADVANCED_ABSTRACT: SpeakingPromptBlueprint[] = [
  {
    prompt: 'To what extent does technology improve education?',
    example_answer:
      'Technology can make learning more accessible, yet it cannot replace thoughtful teaching and human connection.',
  },
  {
    prompt: 'Is economic growth always good for society?',
    example_answer:
      'Economic growth can raise living standards, but it may also increase inequality if benefits are not shared fairly.',
  },
  {
    prompt: 'Should governments limit freedom of speech online?',
    example_answer:
      'Governments should protect citizens from harm, but broad censorship can weaken democratic debate.',
  },
];

const ADVANCED_ARGUMENTS: SpeakingPromptBlueprint[] = [
  {
    prompt: 'Argue for or against banning cars from city centres.',
    example_answer:
      'Although car bans reduce pollution, cities must first improve public transport so commuters are not disadvantaged.',
  },
  {
    prompt: 'Present an argument about whether universities should be free.',
    example_answer:
      'Free university education promotes equality, but funding must be sustainable to maintain quality.',
  },
  {
    prompt: 'Debate whether artificial intelligence will create more jobs than it destroys.',
    example_answer:
      'AI will eliminate routine tasks, yet it will also create new roles for people who can adapt and learn new skills.',
  },
];

export const SPEAKING_PROMPT_BLUEPRINTS: Record<SpeakingTopic, LevelSeeds> = {
  self_introduction: {
    beginner: [
      ...BEGINNER_PERSONAL,
      {
        prompt: 'Introduce yourself to a new classmate.',
        example_answer:
          'Hello, my name is Alex and I am from Canada. I like reading and playing tennis.',
      },
    ],
    intermediate: [],
    advanced: [],
  },
  daily_routines: {
    beginner: [
      {
        prompt: 'What do you usually do in the morning?',
        example_answer:
          'I wake up at seven, eat breakfast, and take the bus to work.',
      },
      {
        prompt: 'What do you often do in the evening?',
        example_answer:
          'In the evening, I cook dinner and watch a short show with my family.',
      },
      {
        prompt: 'What do you like to do at the weekend?',
        example_answer:
          'At the weekend, I like to meet friends and go for a walk in the park.',
      },
    ],
    intermediate: INTERMEDIATE_DAILY,
    advanced: [],
  },
  travel_stories: {
    beginner: [],
    intermediate: [
      {
        prompt: 'Talk about a place you visited and what you liked there.',
        example_answer:
          'Last summer I visited Lisbon and I loved the food and the friendly people.',
      },
      {
        prompt: 'Describe a travel problem you had and how you solved it.',
        example_answer:
          'My train was delayed, so I called my hotel and changed my check-in time.',
      },
      ...INTERMEDIATE_DAILY.slice(0, 1),
    ],
    advanced: [],
  },
  opinions: {
    beginner: [],
    intermediate: [
      ...INTERMEDIATE_OPINIONS,
      {
        prompt: 'Share your opinion about living in a big city.',
        example_answer:
          'In my opinion, living in a big city is exciting because there are many opportunities.',
      },
    ],
    advanced: [],
  },
  presentations: {
    beginner: [],
    intermediate: [],
    advanced: [
      {
        prompt: 'Give a short opening for a presentation about teamwork.',
        example_answer:
          'Good morning everyone. Today I will explain why teamwork improves results in modern companies.',
      },
      ...ADVANCED_ABSTRACT.slice(0, 2),
    ],
  },
  debates: {
    beginner: [],
    intermediate: [],
    advanced: [
      ...ADVANCED_ARGUMENTS,
      {
        prompt: 'Argue whether remote work is better than office work.',
        example_answer:
          'Although remote work offers flexibility, I believe offices help teams collaborate more effectively.',
      },
    ],
  },
};

/** Level-wide fallback pools when a topic has no seeds at the requested level. */
export const SPEAKING_LEVEL_FALLBACK_BLUEPRINTS: Record<
  LearnerLevel,
  SpeakingPromptBlueprint[]
> = {
  beginner: BEGINNER_PERSONAL,
  intermediate: [...INTERMEDIATE_DAILY, ...INTERMEDIATE_OPINIONS],
  advanced: [...ADVANCED_ABSTRACT, ...ADVANCED_ARGUMENTS],
};
