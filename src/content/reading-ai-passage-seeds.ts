import { LearnerLevel } from './englexa-content-spec.constants';
import { ReadingTopic } from '../reading-practice/interfaces/reading-passage.interface';

export interface ReadingQuestionBlueprint {
  type: 'mcq' | 'short_answer';
  question: string;
  options: string[] | null;
  correct_answer: string;
  explanation: string;
  alternatives?: string[];
}

export interface ReadingPassageBlueprint {
  title: string;
  passage: string;
  questions: ReadingQuestionBlueprint[];
}

type LevelSeeds = Record<LearnerLevel, ReadingPassageBlueprint[]>;

function topic(seeds: LevelSeeds): Record<LearnerLevel, ReadingPassageBlueprint[]> {
  return seeds;
}

function b(partial: ReadingPassageBlueprint): ReadingPassageBlueprint {
  return partial;
}

export const DEFAULT_READING_AI_TOPIC: ReadingTopic = 'short_dialogues';

export const READING_PASSAGE_BLUEPRINTS: Partial<
  Record<ReadingTopic, Record<LearnerLevel, ReadingPassageBlueprint[]>>
> = {
  short_dialogues: topic({
    beginner: [
      b({
        title: 'At the Library Desk',
        passage:
          'Student: Excuse me, I need help finding a book.\nLibrarian: Of course. What is the title?\nStudent: It is called "Easy English Stories."\nLibrarian: Yes, it is on shelf B4.\nStudent: Can I borrow it for two weeks?\nLibrarian: Yes. Please show me your library card.\nStudent: Here it is. Thank you!',
        questions: [
          {
            type: 'mcq',
            question: 'What does the student want?',
            options: ['A map', 'Help finding a book', 'A new card', 'A computer'],
            correct_answer: 'Help finding a book',
            explanation:
              'The student says, "I need help finding a book." That is the reason for the conversation.',
          },
          {
            type: 'short_answer',
            question: 'What is the name of the book?',
            options: null,
            correct_answer: 'Easy English Stories',
            explanation:
              'When the librarian asks for the title, the student answers, "It is called Easy English Stories."',
          },
          {
            type: 'mcq',
            question: 'Where is the book?',
            options: ['Shelf A1', 'Shelf B4', 'Shelf C2', 'At the front desk'],
            correct_answer: 'Shelf B4',
            explanation:
              'The librarian tells the student the book is on shelf B4, so that is the correct location.',
          },
          {
            type: 'short_answer',
            question: 'How long can the student borrow the book?',
            options: null,
            correct_answer: 'two weeks',
            alternatives: ['2 weeks'],
            explanation:
              'The student asks to borrow the book for two weeks, and the librarian agrees.',
          },
          {
            type: 'mcq',
            question: 'What must the student show to borrow the book?',
            options: ['A passport', 'A library card', 'A student ID only', 'Cash'],
            correct_answer: 'A library card',
            explanation:
              'The librarian says, "Please show me your library card," and the student hands it over.',
          },
        ],
      }),
      b({
        title: 'Calling a Friend',
        passage:
          'Mia: Hi Sam, are you free on Saturday?\nSam: I think so. Why?\nMia: I want to see the new film at the mall.\nSam: Sounds good. What time does it start?\nMia: At four o\'clock.\nSam: Perfect. Let\'s meet at the cinema at three thirty.\nMia: Great! See you then.',
        questions: [
          {
            type: 'mcq',
            question: 'What does Mia want to do?',
            options: ['Go shopping', 'See a film', 'Study together', 'Play football'],
            correct_answer: 'See a film',
            explanation:
              'Mia says she wants to see the new film at the mall, so they plan a cinema visit.',
          },
          {
            type: 'short_answer',
            question: 'When does the film start?',
            options: null,
            correct_answer: 'four o\'clock',
            alternatives: ['4 o\'clock', 'at four o\'clock'],
            explanation:
              'Mia tells Sam the film starts at four o\'clock.',
          },
          {
            type: 'mcq',
            question: 'Where will they meet?',
            options: ['At the mall entrance', 'At the cinema', 'At Mia\'s house', 'At the bus stop'],
            correct_answer: 'At the cinema',
            explanation:
              'Sam suggests meeting at the cinema, so "At the cinema" is correct because that is where they agree to meet.',
          },
          {
            type: 'short_answer',
            question: 'On which day do they make plans?',
            options: null,
            correct_answer: 'Saturday',
            explanation:
              'Mia asks if Sam is free on Saturday at the start, so Saturday is correct because that is the day they plan for.',
          },
        ],
      }),
    ],
    intermediate: [],
    advanced: [],
  }),
  simple_stories: topic({
    beginner: [
      b({
        title: 'The Lost Key',
        passage:
          'Leo woke up late on Monday morning. He ate breakfast quickly and ran to the door. Then he stopped. His keys were not on the table. He looked in his coat, under the sofa, and in the kitchen. Nothing. Leo called his sister. She laughed and said, "Check your bag." The keys were inside. Leo smiled, locked the door, and walked to work on time.',
        questions: [
          {
            type: 'mcq',
            question: 'Why was Leo in a hurry?',
            options: [
              'He missed the bus',
              'He woke up late',
              'He lost his phone',
              'He forgot his lunch',
            ],
            correct_answer: 'He woke up late',
            explanation:
              'The story begins with "Leo woke up late on Monday morning," which explains why he rushed.',
          },
          {
            type: 'short_answer',
            question: 'What was Leo looking for?',
            options: null,
            correct_answer: 'his keys',
            alternatives: ['keys'],
            explanation:
              'The passage says his keys were not on the table and he searched for them in several places.',
          },
          {
            type: 'mcq',
            question: 'Who helped Leo?',
            options: ['His boss', 'His sister', 'A neighbour', 'A coworker'],
            correct_answer: 'His sister',
            explanation:
              'Leo called his sister, and she told him to check his bag.',
          },
          {
            type: 'short_answer',
            question: 'Where were the keys?',
            options: null,
            correct_answer: 'in his bag',
            alternatives: ['his bag', 'inside his bag'],
            explanation:
              'His sister suggested checking the bag, and the keys were inside.',
          },
        ],
      }),
    ],
    intermediate: [],
    advanced: [],
  }),
  news_snippets: topic({
    beginner: [],
    intermediate: [
      b({
        title: 'City Opens New Bike Lanes',
        passage:
          'The city council announced ten kilometres of new bike lanes this week. Officials said the lanes will connect schools, parks, and the train station. Construction begins in April and should finish before winter. Local groups welcomed the plan, saying it will make commuting safer. However, some shop owners worry about losing parking spaces. The mayor promised public meetings to discuss the changes.',
        questions: [
          {
            type: 'mcq',
            question: 'What did the city announce?',
            options: [
              'A new train station',
              'New bike lanes',
              'Free bus tickets',
              'A parking garage',
            ],
            correct_answer: 'New bike lanes',
            explanation:
              'The first sentence states the council announced ten kilometres of new bike lanes.',
          },
          {
            type: 'short_answer',
            question: 'When does construction begin?',
            options: null,
            correct_answer: 'April',
            explanation:
              'The passage says construction begins in April and should finish before winter.',
          },
          {
            type: 'mcq',
            question: 'Why are some shop owners concerned?',
            options: [
              'Higher taxes',
              'Losing parking spaces',
              'Road closures forever',
              'Fewer customers on bikes',
            ],
            correct_answer: 'Losing parking spaces',
            explanation:
              'The text says some shop owners worry about losing parking spaces because of the plan.',
          },
          {
            type: 'short_answer',
            question: 'What will the mayor offer to discuss the plan?',
            options: null,
            correct_answer: 'public meetings',
            alternatives: ['meetings'],
            explanation:
              'The mayor promised public meetings so residents can discuss the changes.',
          },
          {
            type: 'mcq',
            question: 'How do local groups feel about the lanes?',
            options: ['Angry', 'Unsure', 'Welcoming', 'Silent'],
            correct_answer: 'Welcoming',
            explanation:
              'Local groups welcomed the plan because they believe it will make commuting safer.',
          },
        ],
      }),
    ],
    advanced: [],
  }),
  opinion_paragraphs: topic({
    beginner: [],
    intermediate: [
      b({
        title: 'Should Schools Start Later?',
        passage:
          'Many teenagers feel tired in early morning classes. Sleep researchers argue that adolescents need more rest than adults and that later start times can improve focus. Critics, however, say later schedules disrupt family routines and after-school activities. In my view, schools should trial a later start for one term and measure attendance and grades. Evidence, not habit, should guide the decision.',
        questions: [
          {
            type: 'mcq',
            question: 'What is the writer\'s main suggestion?',
            options: [
              'Cancel morning classes',
              'Trial a later start for one term',
              'Remove after-school sports',
              'Give students more homework',
            ],
            correct_answer: 'Trial a later start for one term',
            explanation:
              'The writer says schools should trial a later start and then measure results.',
          },
          {
            type: 'short_answer',
            question: 'What do sleep researchers say teenagers need?',
            options: null,
            correct_answer: 'more rest',
            alternatives: ['more sleep', 'more rest than adults'],
            explanation:
              'Researchers argue adolescents need more rest than adults.',
          },
          {
            type: 'mcq',
            question: 'What concern do critics raise?',
            options: [
              'Teachers will quit',
              'Family routines may be disrupted',
              'Buses will be expensive',
              'Students will skip lunch',
            ],
            correct_answer: 'Family routines may be disrupted',
            explanation:
              'Critics say later schedules disrupt family routines and after-school activities.',
          },
          {
            type: 'short_answer',
            question: 'What should guide the decision, according to the writer?',
            options: null,
            correct_answer: 'evidence',
            explanation:
              'The final sentence says evidence, not habit, should guide the decision.',
          },
        ],
      }),
    ],
    advanced: [],
  }),
  essays: topic({
    beginner: [],
    intermediate: [],
    advanced: [
      b({
        title: 'The Value of Public Libraries',
        passage:
          'Public libraries remain essential civic spaces in a digital age. Beyond lending books, they provide internet access, literacy programmes, and quiet study areas for people who lack resources at home. Funding cuts threaten these services, yet the social return is substantial: libraries support education, job searches, and community connection. Policymakers should treat them as infrastructure, not optional extras, because equal access to information strengthens democracy.',
        questions: [
          {
            type: 'mcq',
            question: 'What is the author\'s central claim?',
            options: [
              'Libraries should sell more books',
              'Libraries remain essential civic spaces',
              'Digital devices replace all reading',
              'Quiet study is no longer needed',
            ],
            correct_answer: 'Libraries remain essential civic spaces',
            explanation:
              'The opening sentence states that public libraries remain essential civic spaces in a digital age.',
          },
          {
            type: 'short_answer',
            question: 'Name one service libraries provide besides lending books.',
            options: null,
            correct_answer: 'internet access',
            alternatives: ['literacy programmes', 'quiet study areas'],
            explanation:
              'The passage lists internet access, literacy programmes, and quiet study areas as additional services.',
          },
          {
            type: 'mcq',
            question: 'What threatens library services?',
            options: ['Too many visitors', 'Funding cuts', 'New technology', 'Longer hours'],
            correct_answer: 'Funding cuts',
            explanation:
              'The author writes that funding cuts threaten these services.',
          },
          {
            type: 'short_answer',
            question: 'How should policymakers treat libraries?',
            options: null,
            correct_answer: 'as infrastructure',
            alternatives: ['infrastructure'],
            explanation:
              'The writer argues policymakers should treat libraries as infrastructure, not optional extras.',
          },
          {
            type: 'mcq',
            question: 'Why does equal access to information matter?',
            options: [
              'It reduces taxes',
              'It strengthens democracy',
              'It ends publishing costs',
              'It replaces schools',
            ],
            correct_answer: 'It strengthens democracy',
            explanation:
              'The final clause states equal access to information strengthens democracy.',
          },
        ],
      }),
    ],
  }),
  argumentative_texts: topic({
    beginner: [],
    intermediate: [],
    advanced: [
      b({
        title: 'Regulating Short-Term Rentals',
        passage:
          'Short-term rental platforms have transformed travel, but they also reduce housing supply in crowded cities. Landlords can earn more from weekly tourists than from long-term tenants, which pushes up rents for residents. A balanced policy should require hosts to register properties, pay local taxes, and limit the number of nights a unit may be rented each year. Complete bans are unnecessary; transparent rules can protect neighbourhoods while keeping tourism benefits.',
        questions: [
          {
            type: 'mcq',
            question: 'What problem does the author identify?',
            options: [
              'Tourists avoid city centres',
              'Housing supply falls in crowded cities',
              'Hotels are always cheaper',
              'Platforms lack mobile apps',
            ],
            correct_answer: 'Housing supply falls in crowded cities',
            explanation:
              'The author states short-term rentals reduce housing supply in crowded cities.',
          },
          {
            type: 'short_answer',
            question: 'Why might landlords prefer short-term guests?',
            options: null,
            correct_answer: 'they can earn more',
            alternatives: ['earn more', 'more money'],
            explanation:
              'The text says landlords can earn more from weekly tourists than from long-term tenants.',
          },
          {
            type: 'mcq',
            question: 'Which policy does the writer support?',
            options: [
              'A complete ban on rentals',
              'Registration, taxes, and night limits',
              'No rules for hosts',
              'Free housing for tourists',
            ],
            correct_answer: 'Registration, taxes, and night limits',
            explanation:
              'The author proposes registration, local taxes, and limits on rental nights per year.',
          },
          {
            type: 'short_answer',
            question: 'Does the author want a complete ban?',
            options: null,
            correct_answer: 'no',
            alternatives: ['No'],
            explanation:
              'The passage says complete bans are unnecessary and argues for transparent rules instead.',
          },
        ],
      }),
    ],
  }),
};
