import { ExerciseType, Level, Prisma } from '@prisma/client';

export interface SeedExercise {
  type: ExerciseType;
  prompt: string;
  optionsJson: Prisma.InputJsonValue;
  answerJson: Prisma.InputJsonValue;
}

export interface SeedLesson {
  level: Level;
  title: string;
  description: string;
  contentJson: Prisma.InputJsonValue;
  exercises: SeedExercise[];
}

const a1Lessons: SeedLesson[] = [
  {
    level: Level.A1,
    title: 'Greetings',
    description: 'Say hello and introduce yourself.',
    contentJson: { topic: 'greetings', objectives: ['hello', 'goodbye', 'name'] },
    exercises: [
      {
        type: ExerciseType.MULTIPLE_CHOICE,
        prompt: 'How do you greet someone in the morning?',
        optionsJson: {
          choices: [
            { id: 'a', text: 'Good night' },
            { id: 'b', text: 'Good morning' },
            { id: 'c', text: 'Good afternoon' },
          ],
        },
        answerJson: { correctOptionId: 'b' },
      },
      {
        type: ExerciseType.FILL_IN_THE_BLANK,
        prompt: 'Complete: My name ___ Anna.',
        optionsJson: { template: 'My name ___ Anna.', blanks: 1 },
        answerJson: { answers: ['is'] },
      },
    ],
  },
  {
    level: Level.A1,
    title: 'Numbers 1–10',
    description: 'Count from one to ten.',
    contentJson: { topic: 'numbers', range: [1, 10] },
    exercises: [
      {
        type: ExerciseType.MULTIPLE_CHOICE,
        prompt: 'What comes after seven?',
        optionsJson: {
          choices: [
            { id: 'a', text: 'six' },
            { id: 'b', text: 'eight' },
            { id: 'c', text: 'nine' },
          ],
        },
        answerJson: { correctOptionId: 'b' },
      },
      {
        type: ExerciseType.REORDER_SENTENCE,
        prompt: 'Put the words in order: have / I / two / cats',
        optionsJson: { words: ['have', 'I', 'two', 'cats'] },
        answerJson: { order: ['I', 'have', 'two', 'cats'] },
      },
    ],
  },
  {
    level: Level.A1,
    title: 'Colors',
    description: 'Learn basic color words.',
    contentJson: { topic: 'colors' },
    exercises: [
      {
        type: ExerciseType.PICTURE_WORD_MATCH,
        prompt: 'Match each picture to the correct color word.',
        optionsJson: {
          images: [
            { id: 'red-img', url: 'https://placehold.co/80x80/red/white?text=R' },
            { id: 'blue-img', url: 'https://placehold.co/80x80/blue/white?text=B' },
          ],
          words: ['red', 'blue', 'green'],
        },
        answerJson: {
          pairs: [
            { imageId: 'red-img', word: 'red' },
            { imageId: 'blue-img', word: 'blue' },
          ],
        },
      },
    ],
  },
  {
    level: Level.A1,
    title: 'Family',
    description: 'Talk about your family members.',
    contentJson: { topic: 'family' },
    exercises: [
      {
        type: ExerciseType.MULTIPLE_CHOICE,
        prompt: 'Your mother\'s mother is your ___.',
        optionsJson: {
          choices: [
            { id: 'a', text: 'aunt' },
            { id: 'b', text: 'grandmother' },
            { id: 'c', text: 'sister' },
          ],
        },
        answerJson: { correctOptionId: 'b' },
      },
      {
        type: ExerciseType.FILL_IN_THE_BLANK,
        prompt: 'This is my ___. (father\'s brother)',
        optionsJson: { template: 'This is my ___.', blanks: 1 },
        answerJson: { answers: ['uncle'] },
      },
    ],
  },
  {
    level: Level.A1,
    title: 'Food & Drinks',
    description: 'Order simple food and drinks.',
    contentJson: { topic: 'food' },
    exercises: [
      {
        type: ExerciseType.MULTIPLE_CHOICE,
        prompt: 'Which is a drink?',
        optionsJson: {
          choices: [
            { id: 'a', text: 'bread' },
            { id: 'b', text: 'water' },
            { id: 'c', text: 'rice' },
          ],
        },
        answerJson: { correctOptionId: 'b' },
      },
      {
        type: ExerciseType.REORDER_SENTENCE,
        prompt: 'Order: would / like / I / tea',
        optionsJson: { words: ['would', 'like', 'I', 'tea'] },
        answerJson: { order: ['I', 'would', 'like', 'tea'] },
      },
    ],
  },
  {
    level: Level.A1,
    title: 'Days of the Week',
    description: 'Name the days from Monday to Sunday.',
    contentJson: { topic: 'calendar' },
    exercises: [
      {
        type: ExerciseType.MULTIPLE_CHOICE,
        prompt: 'The first day of the work week is ___.',
        optionsJson: {
          choices: [
            { id: 'a', text: 'Sunday' },
            { id: 'b', text: 'Monday' },
            { id: 'c', text: 'Friday' },
          ],
        },
        answerJson: { correctOptionId: 'b' },
      },
    ],
  },
  {
    level: Level.A1,
    title: 'At School',
    description: 'Classroom objects and places.',
    contentJson: { topic: 'school' },
    exercises: [
      {
        type: ExerciseType.FILL_IN_THE_BLANK,
        prompt: 'I write with a ___.',
        optionsJson: { template: 'I write with a ___.', blanks: 1 },
        answerJson: { answers: ['pen'] },
      },
      {
        type: ExerciseType.MULTIPLE_CHOICE,
        prompt: 'Where do students eat lunch?',
        optionsJson: {
          choices: [
            { id: 'a', text: 'cafeteria' },
            { id: 'b', text: 'library' },
            { id: 'c', text: 'garden' },
          ],
        },
        answerJson: { correctOptionId: 'a' },
      },
    ],
  },
  {
    level: Level.A1,
    title: 'Weather',
    description: 'Describe sunny, rainy, and cloudy days.',
    contentJson: { topic: 'weather' },
    exercises: [
      {
        type: ExerciseType.MULTIPLE_CHOICE,
        prompt: 'When water falls from clouds, it is ___.',
        optionsJson: {
          choices: [
            { id: 'a', text: 'windy' },
            { id: 'b', text: 'rainy' },
            { id: 'c', text: 'snowy' },
          ],
        },
        answerJson: { correctOptionId: 'b' },
      },
    ],
  },
  {
    level: Level.A1,
    title: 'Animals',
    description: 'Common animals and pets.',
    contentJson: { topic: 'animals' },
    exercises: [
      {
        type: ExerciseType.PICTURE_WORD_MATCH,
        prompt: 'Match animals to their names.',
        optionsJson: {
          images: [
            { id: 'cat-img', url: 'https://placehold.co/80x80/orange/white?text=Cat' },
            { id: 'dog-img', url: 'https://placehold.co/80x80/brown/white?text=Dog' },
          ],
          words: ['cat', 'dog', 'bird'],
        },
        answerJson: {
          pairs: [
            { imageId: 'cat-img', word: 'cat' },
            { imageId: 'dog-img', word: 'dog' },
          ],
        },
      },
    ],
  },
  {
    level: Level.A1,
    title: 'Simple Present',
    description: 'Use am, is, are correctly.',
    contentJson: { topic: 'grammar', grammarPoint: 'to be' },
    exercises: [
      {
        type: ExerciseType.FILL_IN_THE_BLANK,
        prompt: 'They ___ students.',
        optionsJson: { template: 'They ___ students.', blanks: 1 },
        answerJson: { answers: ['are'] },
      },
      {
        type: ExerciseType.REORDER_SENTENCE,
        prompt: 'Order: is / she / happy',
        optionsJson: { words: ['is', 'she', 'happy'] },
        answerJson: { order: ['she', 'is', 'happy'] },
      },
    ],
  },
];

const a2Lessons: SeedLesson[] = [
  {
    level: Level.A2,
    title: 'Daily Routine',
    description: 'Talk about what you do every day.',
    contentJson: { topic: 'routine' },
    exercises: [
      {
        type: ExerciseType.MULTIPLE_CHOICE,
        prompt: 'I ___ breakfast at 7 a.m.',
        optionsJson: {
          choices: [
            { id: 'a', text: 'eat' },
            { id: 'b', text: 'eats' },
            { id: 'c', text: 'eating' },
          ],
        },
        answerJson: { correctOptionId: 'a' },
      },
      {
        type: ExerciseType.FILL_IN_THE_BLANK,
        prompt: 'She ___ to work by bus. (go)',
        optionsJson: { template: 'She ___ to work by bus.', blanks: 1 },
        answerJson: { answers: ['goes'] },
      },
    ],
  },
  {
    level: Level.A2,
    title: 'Past Simple',
    description: 'Describe finished actions in the past.',
    contentJson: { topic: 'grammar', grammarPoint: 'past simple' },
    exercises: [
      {
        type: ExerciseType.MULTIPLE_CHOICE,
        prompt: 'Yesterday I ___ to the park.',
        optionsJson: {
          choices: [
            { id: 'a', text: 'go' },
            { id: 'b', text: 'went' },
            { id: 'c', text: 'going' },
          ],
        },
        answerJson: { correctOptionId: 'b' },
      },
      {
        type: ExerciseType.REORDER_SENTENCE,
        prompt: 'Order: watched / we / a / film',
        optionsJson: { words: ['watched', 'we', 'a', 'film'] },
        answerJson: { order: ['we', 'watched', 'a', 'film'] },
      },
    ],
  },
  {
    level: Level.A2,
    title: 'Shopping',
    description: 'Ask prices and buy clothes.',
    contentJson: { topic: 'shopping' },
    exercises: [
      {
        type: ExerciseType.FILL_IN_THE_BLANK,
        prompt: 'How ___ does this shirt cost?',
        optionsJson: { template: 'How ___ does this shirt cost?', blanks: 1 },
        answerJson: { answers: ['much'] },
      },
      {
        type: ExerciseType.MULTIPLE_CHOICE,
        prompt: 'A place where you buy food is a ___.',
        optionsJson: {
          choices: [
            { id: 'a', text: 'supermarket' },
            { id: 'b', text: 'hospital' },
            { id: 'c', text: 'station' },
          ],
        },
        answerJson: { correctOptionId: 'a' },
      },
    ],
  },
  {
    level: Level.A2,
    title: 'Travel',
    description: 'Book tickets and ask for directions.',
    contentJson: { topic: 'travel' },
    exercises: [
      {
        type: ExerciseType.MULTIPLE_CHOICE,
        prompt: 'You catch a train at the ___.',
        optionsJson: {
          choices: [
            { id: 'a', text: 'station' },
            { id: 'b', text: 'kitchen' },
            { id: 'c', text: 'office' },
          ],
        },
        answerJson: { correctOptionId: 'a' },
      },
    ],
  },
  {
    level: Level.A2,
    title: 'Health',
    description: 'Explain how you feel at the doctor.',
    contentJson: { topic: 'health' },
    exercises: [
      {
        type: ExerciseType.FILL_IN_THE_BLANK,
        prompt: 'I have a ___ and a fever.',
        optionsJson: { template: 'I have a ___ and a fever.', blanks: 1 },
        answerJson: { answers: ['headache'] },
      },
      {
        type: ExerciseType.MULTIPLE_CHOICE,
        prompt: 'When you are sick, you go to the ___.',
        optionsJson: {
          choices: [
            { id: 'a', text: 'doctor' },
            { id: 'b', text: 'bank' },
            { id: 'c', text: 'museum' },
          ],
        },
        answerJson: { correctOptionId: 'a' },
      },
    ],
  },
  {
    level: Level.A2,
    title: 'Hobbies',
    description: 'Talk about free-time activities.',
    contentJson: { topic: 'hobbies' },
    exercises: [
      {
        type: ExerciseType.REORDER_SENTENCE,
        prompt: 'Order: playing / enjoy / I / tennis',
        optionsJson: { words: ['playing', 'enjoy', 'I', 'tennis'] },
        answerJson: { order: ['I', 'enjoy', 'playing', 'tennis'] },
      },
    ],
  },
  {
    level: Level.A2,
    title: 'Comparatives',
    description: 'Compare people, places, and things.',
    contentJson: { topic: 'grammar', grammarPoint: 'comparatives' },
    exercises: [
      {
        type: ExerciseType.MULTIPLE_CHOICE,
        prompt: 'A car is ___ than a bicycle. (fast)',
        optionsJson: {
          choices: [
            { id: 'a', text: 'fast' },
            { id: 'b', text: 'faster' },
            { id: 'c', text: 'fastest' },
          ],
        },
        answerJson: { correctOptionId: 'b' },
      },
      {
        type: ExerciseType.FILL_IN_THE_BLANK,
        prompt: 'This book is ___ than that one. (interesting)',
        optionsJson: {
          template: 'This book is ___ than that one.',
          blanks: 1,
        },
        answerJson: { answers: ['more interesting'] },
      },
    ],
  },
  {
    level: Level.A2,
    title: 'Future Plans',
    description: 'Use going to for future intentions.',
    contentJson: { topic: 'grammar', grammarPoint: 'going to' },
    exercises: [
      {
        type: ExerciseType.REORDER_SENTENCE,
        prompt: 'Order: going / visit / are / we / London',
        optionsJson: { words: ['going', 'visit', 'are', 'we', 'London', 'to'] },
        answerJson: { order: ['we', 'are', 'going', 'to', 'visit', 'London'] },
      },
    ],
  },
  {
    level: Level.A2,
    title: 'At Work',
    description: 'Describe jobs and workplace tasks.',
    contentJson: { topic: 'work' },
    exercises: [
      {
        type: ExerciseType.MULTIPLE_CHOICE,
        prompt: 'A person who teaches is a ___.',
        optionsJson: {
          choices: [
            { id: 'a', text: 'teacher' },
            { id: 'b', text: 'driver' },
            { id: 'c', text: 'chef' },
          ],
        },
        answerJson: { correctOptionId: 'a' },
      },
      {
        type: ExerciseType.FILL_IN_THE_BLANK,
        prompt: 'I start work at nine ___ the morning.',
        optionsJson: { template: 'I start work at nine ___ the morning.', blanks: 1 },
        answerJson: { answers: ['in'] },
      },
    ],
  },
  {
    level: Level.A2,
    title: 'Invitations',
    description: 'Invite friends and accept or decline politely.',
    contentJson: { topic: 'social' },
    exercises: [
      {
        type: ExerciseType.MULTIPLE_CHOICE,
        prompt: 'Would you like ___ dinner with us?',
        optionsJson: {
          choices: [
            { id: 'a', text: 'have' },
            { id: 'b', text: 'to have' },
            { id: 'c', text: 'having' },
          ],
        },
        answerJson: { correctOptionId: 'b' },
      },
      {
        type: ExerciseType.PICTURE_WORD_MATCH,
        prompt: 'Match event pictures to phrases.',
        optionsJson: {
          images: [
            { id: 'party-img', url: 'https://placehold.co/80x80/purple/white?text=Party' },
            { id: 'movie-img', url: 'https://placehold.co/80x80/black/white?text=Movie' },
          ],
          words: ['birthday party', 'movie night', 'picnic'],
        },
        answerJson: {
          pairs: [
            { imageId: 'party-img', word: 'birthday party' },
            { imageId: 'movie-img', word: 'movie night' },
          ],
        },
      },
    ],
  },
];

export const seedLessons: SeedLesson[] = [...a1Lessons, ...a2Lessons];
