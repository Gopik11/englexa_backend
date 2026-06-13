/**
 * AI exercise blueprints — questions and answers only.
 * Explanations are assembled at generation time via buildGrammarExplanation().
 * All rule text originates from englexa-content-spec.constants.ts.
 */

import { LearnerLevel } from './englexa-content-spec.constants';
import {
  GrammarExerciseBlueprint,
  GrammarTopic,
} from '../grammar-practice/interfaces/grammar-exercise.interface';

type LevelSeeds = Record<LearnerLevel, GrammarExerciseBlueprint[]>;

function b(
  partial: GrammarExerciseBlueprint,
): GrammarExerciseBlueprint {
  return partial;
}

function topic(
  seeds: LevelSeeds,
): Record<LearnerLevel, GrammarExerciseBlueprint[]> {
  return seeds;
}

export const GRAMMAR_EXERCISE_BLUEPRINTS: Partial<
  Record<GrammarTopic, Record<LearnerLevel, GrammarExerciseBlueprint[]>>
> = {
  articles: topic({
    beginner: [
      b({ type: 'fill_blank', question: 'I read ___ book every day.', options: null, correct_answer: 'a', ruleKey: 'article', exampleSentence: 'I read a book every day.', sampleWrongSentence: 'I read book every day.' }),
      b({ type: 'mcq', question: 'Choose the correct article: ___ apple', options: ['a', 'an', 'the'], correct_answer: 'an', ruleKey: 'article', exampleSentence: 'She ate an apple for lunch.', sampleWrongSentence: 'I ate a apple for lunch.' }),
    ],
    intermediate: [
      b({ type: 'fill_blank', question: 'He bought ___ umbrella because it was raining.', options: null, correct_answer: 'an', ruleKey: 'article', exampleSentence: 'He bought an umbrella.', sampleWrongSentence: 'He bought a umbrella because it was raining.' }),
      b({ type: 'rewrite', question: 'Rewrite with the correct article: "They want dog."', options: null, correct_answer: 'They want a dog.', ruleKey: 'article', exampleSentence: 'They want a dog.', sampleWrongSentence: 'They want dog.' }),
    ],
    advanced: [
      b({ type: 'short_answer', question: 'Complete: "It was ___ honor to meet the author." (one word)', options: null, correct_answer: 'an', ruleKey: 'article', exampleSentence: 'It was an honor to meet the author.', sampleWrongSentence: 'It was a honor to meet the author.' }),
      b({ type: 'correction', question: 'Fix the articles: "I saw a elephant at the zoo."', options: null, correct_answer: 'I saw an elephant at the zoo.', ruleKey: 'article', exampleSentence: 'I saw an elephant at the zoo.', sampleWrongSentence: 'I saw a elephant at the zoo.' }),
    ],
  }),
  simple_present: topic({
    beginner: [
      b({ type: 'fill_blank', question: 'He ___ (play) soccer every Saturday.', options: null, correct_answer: 'plays', ruleKey: 'simple_present', exampleSentence: 'He plays soccer every Saturday.', sampleWrongSentence: 'He play soccer every Saturday.' }),
      b({ type: 'correction', question: 'Fix: "She go to the gym on Mondays."', options: null, correct_answer: 'She goes to the gym on Mondays.', ruleKey: 'simple_present', exampleSentence: 'She goes to the gym on Mondays.', sampleWrongSentence: 'She go to the gym on Mondays.' }),
    ],
    intermediate: [
      b({ type: 'mcq', question: 'Choose: "She usually ___ coffee, but today she ___ tea."', options: ['drinks / is drinking', 'is drinking / drinks', 'drink / drinks'], correct_answer: 'drinks / is drinking', ruleKey: 'present_continuous', exampleSentence: 'She usually drinks coffee, but today she is drinking tea.', sampleWrongSentence: 'She usually is drinking coffee.' }),
      b({ type: 'fill_blank', question: 'The shop ___ (open) at 9 AM every day.', options: null, correct_answer: 'opens', ruleKey: 'simple_present', exampleSentence: 'The shop opens at 9 AM every day.', sampleWrongSentence: 'The shop open at 9 AM every day.' }),
    ],
    advanced: [
      b({ type: 'correction', question: 'Fix: "I am thinking you are right."', options: null, correct_answer: 'I think you are right.', ruleKey: 'simple_present', exampleSentence: 'I think you are right.', sampleWrongSentence: 'I am thinking you are right.' }),
      b({ type: 'mcq', question: 'Which sentence is correct?', options: ['Water boils at 100°C.', 'Water is boiling at 100°C.', 'Water boil at 100°C.'], correct_answer: 'Water boils at 100°C.', ruleKey: 'simple_present', exampleSentence: 'Water boils at 100°C.', sampleWrongSentence: 'Water is boiling at 100°C.' }),
    ],
  }),
  simple_past: topic({
    beginner: [
      b({ type: 'fill_blank', question: 'Yesterday, I ___ (walk) to school.', options: null, correct_answer: 'walked', ruleKey: 'verb_tense', exampleSentence: 'Yesterday, I walked to school.', sampleWrongSentence: 'Yesterday, I walk to school.' }),
      b({ type: 'mcq', question: 'Choose the correct past tense: "Last week, they ___ football."', options: ['play', 'played', 'playing'], correct_answer: 'played', ruleKey: 'verb_tense', exampleSentence: 'Last week, they played football.', sampleWrongSentence: 'Last week, they play football.' }),
    ],
    intermediate: [
      b({ type: 'rewrite', question: 'Rewrite in past tense: "We visit our grandparents last Sunday."', options: null, correct_answer: 'We visited our grandparents last Sunday.', ruleKey: 'verb_tense', exampleSentence: 'We visited our grandparents last Sunday.', sampleWrongSentence: 'We visit our grandparents last Sunday.' }),
      b({ type: 'fill_blank', question: 'Two years ago, she ___ (live) in London.', options: null, correct_answer: 'lived', ruleKey: 'verb_tense', exampleSentence: 'Two years ago, she lived in London.', sampleWrongSentence: 'Two years ago, she live in London.' }),
    ],
    advanced: [
      b({ type: 'correction', question: 'Fix the tense: "I did not finished my homework."', options: null, correct_answer: 'I did not finish my homework.', ruleKey: 'verb_tense', exampleSentence: 'I did not finish my homework.', sampleWrongSentence: 'I did not finished my homework.' }),
      b({ type: 'short_answer', question: 'Past tense of "finish": "They ___ the project before the deadline."', options: null, correct_answer: 'finished', ruleKey: 'verb_tense', exampleSentence: 'They finished the project before the deadline.', sampleWrongSentence: 'They finish the project before the deadline.' }),
    ],
  }),
  prepositions: topic({
    beginner: [
      b({ type: 'mcq', question: 'Choose: "I have class ___ Monday."', options: ['in', 'on', 'at'], correct_answer: 'on', ruleKey: 'preposition', exampleSentence: 'I have class on Monday.', sampleWrongSentence: 'I have class at Monday.' }),
      b({ type: 'fill_blank', question: 'She was born ___ 2010.', options: null, correct_answer: 'in', ruleKey: 'preposition', exampleSentence: 'She was born in 2010.', sampleWrongSentence: 'She was born on 2010.' }),
    ],
    intermediate: [
      b({ type: 'rewrite', question: 'Rewrite correctly: "The conference is in Friday."', options: null, correct_answer: 'The conference is on Friday.', ruleKey: 'preposition', exampleSentence: 'The conference is on Friday.', sampleWrongSentence: 'The conference is in Friday.' }),
      b({ type: 'fill_blank', question: 'The train leaves ___ 8:30 AM.', options: null, correct_answer: 'at', ruleKey: 'preposition', exampleSentence: 'The train leaves at 8:30 AM.', sampleWrongSentence: 'The train leaves in 8:30 AM.' }),
    ],
    advanced: [
      b({ type: 'short_answer', question: 'Fill in one word: "We usually go hiking ___ the summer."', options: null, correct_answer: 'in', ruleKey: 'preposition', exampleSentence: 'We usually go hiking in the summer.', sampleWrongSentence: 'We usually go hiking on the summer.' }),
      b({ type: 'correction', question: 'Fix: "I work at Monday and at June."', options: null, correct_answer: 'I work on Monday and in June.', ruleKey: 'preposition', exampleSentence: 'I work on Monday and in June.', sampleWrongSentence: 'I work at Monday and at June.' }),
    ],
  }),
  subject_verb: topic({
    beginner: [
      b({ type: 'correction', question: 'Fix: "Go to school every day."', options: null, correct_answer: 'I go to school every day.', ruleKey: 'missing_subject', exampleSentence: 'I go to school every day.', sampleWrongSentence: 'Go to school every day.' }),
      b({ type: 'mcq', question: 'Which sentence has correct subject-verb agreement?', options: ['She like music.', 'She likes music.', 'She liking music.'], correct_answer: 'She likes music.', ruleKey: 'simple_present', exampleSentence: 'She likes music.', sampleWrongSentence: 'She like music.' }),
    ],
    intermediate: [
      b({ type: 'correction', question: 'Fix: "The dogs runs fast."', options: null, correct_answer: 'The dogs run fast.', ruleKey: 'simple_present', exampleSentence: 'The dogs run fast.', sampleWrongSentence: 'The dogs runs fast.' }),
      b({ type: 'fill_blank', question: 'Maria and Tom ___ (go) to the same school.', options: null, correct_answer: 'go', ruleKey: 'simple_present', exampleSentence: 'Maria and Tom go to the same school.', sampleWrongSentence: 'Maria and Tom goes to the same school.' }),
    ],
    advanced: [
      b({ type: 'rewrite', question: 'Rewrite with a clear subject: "Is important to rest."', options: null, correct_answer: 'It is important to rest.', ruleKey: 'missing_subject', exampleSentence: 'It is important to rest.', sampleWrongSentence: 'Is important to rest.' }),
      b({ type: 'mcq', question: 'Which sentence is complete?', options: ['Walking in the park.', 'She is walking in the park.', 'Walks in the park.'], correct_answer: 'She is walking in the park.', ruleKey: 'missing_subject', exampleSentence: 'She is walking in the park.', sampleWrongSentence: 'Walking in the park.' }),
    ],
  }),
  basic_structure: topic({
    beginner: [
      b({ type: 'correction', question: 'Fix word order: "Every day to work I go."', options: null, correct_answer: 'I go to work every day.', ruleKey: 'missing_subject', exampleSentence: 'I go to work every day.', sampleWrongSentence: 'Every day to work I go.' }),
      b({ type: 'mcq', question: 'Which is a complete sentence?', options: ['Because it was raining.', 'It was raining.', 'Raining hard.'], correct_answer: 'It was raining.', ruleKey: 'missing_subject', exampleSentence: 'It was raining.', sampleWrongSentence: 'Raining hard.' }),
    ],
    intermediate: [
      b({ type: 'rewrite', question: 'Rewrite as a question: "You live in London."', options: null, correct_answer: 'Do you live in London?', ruleKey: 'simple_present', exampleSentence: 'Do you live in London?', sampleWrongSentence: 'You live in London?' }),
      b({ type: 'correction', question: 'Fix the run-on: "I woke up I made coffee."', options: null, correct_answer: 'I woke up and made coffee.', ruleKey: 'missing_subject', exampleSentence: 'I woke up and made coffee.', sampleWrongSentence: 'I woke up I made coffee.' }),
    ],
    advanced: [
      b({ type: 'rewrite', question: 'Combine: "She was tired. She went to bed early."', options: null, correct_answer: 'She was tired, so she went to bed early.', ruleKey: 'connector', exampleSentence: 'She was tired, so she went to bed early.', sampleWrongSentence: 'She was tired. She went to bed early.' }),
      b({ type: 'mcq', question: 'Which sentence is correct?', options: ['I very like this song.', 'I like this song very much.', 'I like very this song.'], correct_answer: 'I like this song very much.', ruleKey: 'adverb', exampleSentence: 'I like this song very much.', sampleWrongSentence: 'I very like this song.' }),
    ],
  }),
  present_vs_continuous: topic({
    beginner: [
      b({ type: 'mcq', question: 'Choose: "Listen! The baby ___."', options: ['cries', 'is crying', 'cry'], correct_answer: 'is crying', ruleKey: 'present_continuous', exampleSentence: 'Listen! The baby is crying.', sampleWrongSentence: 'Listen! The baby cries.' }),
      b({ type: 'fill_blank', question: 'She ___ (work) at a bank. (permanent job)', options: null, correct_answer: 'works', ruleKey: 'simple_present', exampleSentence: 'She works at a bank.', sampleWrongSentence: 'She is working at a bank every day.' }),
    ],
    intermediate: [
      b({ type: 'correction', question: 'Fix: "I am knowing the answer."', options: null, correct_answer: 'I know the answer.', ruleKey: 'simple_present', exampleSentence: 'I know the answer.', sampleWrongSentence: 'I am knowing the answer.' }),
      b({ type: 'rewrite', question: 'Rewrite: "They play soccer now." (action in progress)', options: null, correct_answer: 'They are playing soccer now.', ruleKey: 'present_continuous', exampleSentence: 'They are playing soccer now.', sampleWrongSentence: 'They play soccer now.' }),
    ],
    advanced: [
      b({ type: 'mcq', question: 'Choose: "What ___ you ___ at the moment?"', options: ['do / do', 'are / doing', 'did / do'], correct_answer: 'are / doing', ruleKey: 'present_continuous', exampleSentence: 'What are you doing at the moment?', sampleWrongSentence: 'What do you do at the moment?' }),
      b({ type: 'correction', question: 'Fix: "I am living here since 2019."', options: null, correct_answer: 'I have lived here since 2019.', ruleKey: 'perfect_tense', exampleSentence: 'I have lived here since 2019.', sampleWrongSentence: 'I am living here since 2019.' }),
    ],
  }),
  past_vs_continuous: topic({
    beginner: [
      b({ type: 'fill_blank', question: 'They ___ (watch) TV when the power went out.', options: null, correct_answer: 'were watching', ruleKey: 'past_continuous', exampleSentence: 'They were watching TV when the power went out.', sampleWrongSentence: 'They watched TV when the power went out.' }),
      b({ type: 'mcq', question: 'Choose: "I ___ to Rome in 2019."', options: ['was going', 'went', 'have gone'], correct_answer: 'went', ruleKey: 'verb_tense', exampleSentence: 'I went to Rome in 2019.', sampleWrongSentence: 'I was going to Rome in 2019.' }),
    ],
    intermediate: [
      b({ type: 'correction', question: 'Fix: "I was walk home when it started raining."', options: null, correct_answer: 'I was walking home when it started raining.', ruleKey: 'past_continuous', exampleSentence: 'I was walking home when it started raining.', sampleWrongSentence: 'I was walk home when it started raining.' }),
      b({ type: 'rewrite', question: 'Rewrite: "He broke his leg while he skied."', options: null, correct_answer: 'He broke his leg while he was skiing.', ruleKey: 'past_continuous', exampleSentence: 'He broke his leg while he was skiing.', sampleWrongSentence: 'He broke his leg while he skied.' }),
    ],
    advanced: [
      b({ type: 'fill_blank', question: 'What ___ you ___ (do) at this time last year?', options: null, correct_answer: 'were, doing', ruleKey: 'past_continuous', exampleSentence: 'What were you doing at this time last year?', sampleWrongSentence: 'What did you doing at this time last year?' }),
      b({ type: 'correction', question: 'Fix: "When I arrived, they were already leave."', options: null, correct_answer: 'When I arrived, they had already left.', ruleKey: 'perfect_tense', exampleSentence: 'When I arrived, they had already left.', sampleWrongSentence: 'When I arrived, they were already leave.' }),
    ],
  }),
  countable_uncountable: topic({
    beginner: [
      b({ type: 'mcq', question: 'Choose: "How ___ apples do you need?"', options: ['much', 'many', 'lot'], correct_answer: 'many', ruleKey: 'countable', exampleSentence: 'How many apples do you need?', sampleWrongSentence: 'How much apples do you need?' }),
      b({ type: 'fill_blank', question: 'There isn\'t ___ sugar left.', options: null, correct_answer: 'much', ruleKey: 'countable', exampleSentence: 'There isn\'t much sugar left.', sampleWrongSentence: 'There isn\'t many sugar left.' }),
    ],
    intermediate: [
      b({ type: 'correction', question: 'Fix: "Can I have a informations?"', options: null, correct_answer: 'Can I have some information?', ruleKey: 'countable', exampleSentence: 'Can I have some information?', sampleWrongSentence: 'Can I have a informations?' }),
      b({ type: 'mcq', question: 'Which is correct?', options: ['a piece of advice', 'an advice', 'advices'], correct_answer: 'a piece of advice', ruleKey: 'countable', exampleSentence: 'Can I give you a piece of advice?', sampleWrongSentence: 'Can I give you an advice?' }),
    ],
    advanced: [
      b({ type: 'rewrite', question: 'Rewrite: "I need two bread for dinner."', options: null, correct_answer: 'I need two loaves of bread for dinner.', ruleKey: 'countable', exampleSentence: 'I need two loaves of bread for dinner.', sampleWrongSentence: 'I need two bread for dinner.' }),
      b({ type: 'correction', question: 'Fix: "How much people came to the event?"', options: null, correct_answer: 'How many people came to the event?', ruleKey: 'countable', exampleSentence: 'How many people came to the event?', sampleWrongSentence: 'How much people came to the event?' }),
    ],
  }),
  comparatives: topic({
    beginner: [
      b({ type: 'fill_blank', question: 'Today is ___ (cold) than yesterday.', options: null, correct_answer: 'colder', ruleKey: 'comparative', exampleSentence: 'Today is colder than yesterday.', sampleWrongSentence: 'Today is more cold than yesterday.' }),
      b({ type: 'mcq', question: 'Choose: "She is ___ than her brother."', options: ['tall', 'taller', 'more tall'], correct_answer: 'taller', ruleKey: 'comparative', exampleSentence: 'She is taller than her brother.', sampleWrongSentence: 'She is more tall than her brother.' }),
    ],
    intermediate: [
      b({ type: 'correction', question: 'Fix: "This exercise is more harder than the last one."', options: null, correct_answer: 'This exercise is harder than the last one.', ruleKey: 'comparative', exampleSentence: 'This exercise is harder than the last one.', sampleWrongSentence: 'This exercise is more harder than the last one.' }),
      b({ type: 'fill_blank', question: 'This book is ___ (interesting) than that one.', options: null, correct_answer: 'more interesting', ruleKey: 'comparative', exampleSentence: 'This book is more interesting than that one.', sampleWrongSentence: 'This book is interestinger than that one.' }),
    ],
    advanced: [
      b({ type: 'short_answer', question: 'Comparative of "good": "This result is ___ than before."', options: null, correct_answer: 'better', ruleKey: 'comparative', exampleSentence: 'This result is better than before.', sampleWrongSentence: 'This result is gooder than before.' }),
      b({ type: 'rewrite', question: 'Rewrite: "This phone is not as good as the new one."', options: null, correct_answer: 'The new phone is better than this one.', ruleKey: 'comparative', exampleSentence: 'The new phone is better than this one.', sampleWrongSentence: 'This phone is not as good as the new one.' }),
    ],
  }),
  modals: topic({
    beginner: [
      b({ type: 'mcq', question: 'Choose: "You ___ wear a seatbelt in the car." (rule)', options: ['can', 'must', 'might'], correct_answer: 'must', ruleKey: 'modal', exampleSentence: 'You must wear a seatbelt in the car.', sampleWrongSentence: 'You can wear a seatbelt in the car.' }),
      b({ type: 'fill_blank', question: 'She ___ (can) speak three languages.', options: null, correct_answer: 'can', ruleKey: 'modal', exampleSentence: 'She can speak three languages.', sampleWrongSentence: 'She can to speak three languages.' }),
    ],
    intermediate: [
      b({ type: 'correction', question: 'Fix: "You should to study more."', options: null, correct_answer: 'You should study more.', ruleKey: 'modal', exampleSentence: 'You should study more.', sampleWrongSentence: 'You should to study more.' }),
      b({ type: 'mcq', question: 'Choose: "It ___ rain later, so take an umbrella."', options: ['must', 'might', 'can\'t'], correct_answer: 'might', ruleKey: 'modal', exampleSentence: 'It might rain later, so take an umbrella.', sampleWrongSentence: 'It must rain later, so take an umbrella.' }),
    ],
    advanced: [
      b({ type: 'rewrite', question: 'Rewrite: "It\'s impossible that he is at home now."', options: null, correct_answer: 'He can\'t be at home now.', ruleKey: 'modal', exampleSentence: 'He can\'t be at home now.', sampleWrongSentence: 'It\'s impossible that he is at home now.' }),
      b({ type: 'correction', question: 'Fix: "He can to drive a truck."', options: null, correct_answer: 'He can drive a truck.', ruleKey: 'modal', exampleSentence: 'He can drive a truck.', sampleWrongSentence: 'He can to drive a truck.' }),
    ],
  }),
  adverbs: topic({
    beginner: [
      b({ type: 'fill_blank', question: 'She speaks English ___. (fluent)', options: null, correct_answer: 'fluently', ruleKey: 'adverb', exampleSentence: 'She speaks English fluently.', sampleWrongSentence: 'She speaks English fluent.' }),
      b({ type: 'mcq', question: 'Choose the correct word order:', options: ['She always is late.', 'She is always late.', 'Always she is late.'], correct_answer: 'She is always late.', ruleKey: 'adverb', exampleSentence: 'She is always late.', sampleWrongSentence: 'She always is late.' }),
    ],
    intermediate: [
      b({ type: 'correction', question: 'Fix: "He drives careful on highways."', options: null, correct_answer: 'He drives carefully on highways.', ruleKey: 'adverb', exampleSentence: 'He drives carefully on highways.', sampleWrongSentence: 'He drives careful on highways.' }),
      b({ type: 'fill_blank', question: 'I ___ (recent) started learning French.', options: null, correct_answer: 'recently', ruleKey: 'adverb', exampleSentence: 'I recently started learning French.', sampleWrongSentence: 'I recent started learning French.' }),
    ],
    advanced: [
      b({ type: 'mcq', question: 'Choose: "He works hard." vs "He works hardly." — which means with effort?', options: ['He works hard.', 'He works hardly.', 'Both mean the same.'], correct_answer: 'He works hard.', ruleKey: 'adverb', exampleSentence: 'He works hard.', sampleWrongSentence: 'He works hardly.' }),
      b({ type: 'correction', question: 'Fix: "She sings beautiful."', options: null, correct_answer: 'She sings beautifully.', ruleKey: 'adverb', exampleSentence: 'She sings beautifully.', sampleWrongSentence: 'She sings beautiful.' }),
    ],
  }),
  conditionals: topic({
    beginner: [
      b({ type: 'mcq', question: 'Choose: "If it rains tomorrow, we ___ the picnic."', options: ['cancel', 'will cancel', 'cancelled'], correct_answer: 'will cancel', ruleKey: 'conditional', exampleSentence: 'If it rains tomorrow, we will cancel the picnic.', sampleWrongSentence: 'If it rains tomorrow, we cancel the picnic.' }),
      b({ type: 'fill_blank', question: 'If you heat ice, it ___. (melt)', options: null, correct_answer: 'melts', ruleKey: 'conditional', exampleSentence: 'If you heat ice, it melts.', sampleWrongSentence: 'If you heat ice, it will melt.' }),
    ],
    intermediate: [
      b({ type: 'correction', question: 'Fix: "If I will see him, I tell him."', options: null, correct_answer: 'If I see him, I will tell him.', ruleKey: 'conditional', exampleSentence: 'If I see him, I will tell him.', sampleWrongSentence: 'If I will see him, I tell him.' }),
      b({ type: 'fill_blank', question: 'If she ___ (leave) earlier, she wouldn\'t miss the train.', options: null, correct_answer: 'left', ruleKey: 'conditional', exampleSentence: 'If she left earlier, she wouldn\'t miss the train.', sampleWrongSentence: 'If she leaves earlier, she wouldn\'t miss the train.' }),
    ],
    advanced: [
      b({ type: 'rewrite', question: 'Rewrite (third conditional): "I didn\'t study, so I failed."', options: null, correct_answer: 'If I had studied, I would have passed.', ruleKey: 'conditional', exampleSentence: 'If I had studied, I would have passed.', sampleWrongSentence: 'I didn\'t study, so I failed.' }),
      b({ type: 'short_answer', question: 'Complete: "If I ___ (be) you, I\'d accept the offer."', options: null, correct_answer: 'were', ruleKey: 'conditional', exampleSentence: 'If I were you, I\'d accept the offer.', sampleWrongSentence: 'If I am you, I\'d accept the offer.' }),
    ],
  }),
  relative_clauses: topic({
    beginner: [
      b({ type: 'fill_blank', question: 'The woman ___ lives next door is a doctor.', options: null, correct_answer: 'who', ruleKey: 'relative_clause', exampleSentence: 'The woman who lives next door is a doctor.', sampleWrongSentence: 'The woman which lives next door is a doctor.' }),
      b({ type: 'mcq', question: 'Choose: "This is the book ___ I recommended."', options: ['who', 'which', 'where'], correct_answer: 'which', ruleKey: 'relative_clause', exampleSentence: 'This is the book which I recommended.', sampleWrongSentence: 'This is the book who I recommended.' }),
    ],
    intermediate: [
      b({ type: 'correction', question: 'Fix: "The man which called you is my uncle."', options: null, correct_answer: 'The man who called you is my uncle.', ruleKey: 'relative_clause', exampleSentence: 'The man who called you is my uncle.', sampleWrongSentence: 'The man which called you is my uncle.' }),
      b({ type: 'rewrite', question: 'Combine: "I met a student. She speaks five languages."', options: null, correct_answer: 'I met a student who speaks five languages.', ruleKey: 'relative_clause', exampleSentence: 'I met a student who speaks five languages.', sampleWrongSentence: 'I met a student. She speaks five languages.' }),
    ],
    advanced: [
      b({ type: 'fill_blank', question: 'That\'s the restaurant ___ we had dinner.', options: null, correct_answer: 'where', ruleKey: 'relative_clause', exampleSentence: 'That\'s the restaurant where we had dinner.', sampleWrongSentence: 'That\'s the restaurant which we had dinner.' }),
      b({ type: 'correction', question: 'Fix: "The reason because he left is unclear."', options: null, correct_answer: 'The reason why he left is unclear.', ruleKey: 'relative_clause', exampleSentence: 'The reason why he left is unclear.', sampleWrongSentence: 'The reason because he left is unclear.' }),
    ],
  }),
  passive_voice: topic({
    beginner: [
      b({ type: 'mcq', question: 'Choose the passive form: "They build houses here."', options: ['Houses are built here.', 'Houses is built here.', 'Houses were build here.'], correct_answer: 'Houses are built here.', ruleKey: 'passive', exampleSentence: 'Houses are built here.', sampleWrongSentence: 'Houses is built here.' }),
      b({ type: 'fill_blank', question: 'English ___ (speak) all over the world.', options: null, correct_answer: 'is spoken', ruleKey: 'passive', exampleSentence: 'English is spoken all over the world.', sampleWrongSentence: 'English speaks all over the world.' }),
    ],
    intermediate: [
      b({ type: 'correction', question: 'Fix: "The window was break by the ball."', options: null, correct_answer: 'The window was broken by the ball.', ruleKey: 'passive', exampleSentence: 'The window was broken by the ball.', sampleWrongSentence: 'The window was break by the ball.' }),
      b({ type: 'rewrite', question: 'Rewrite in passive: "Someone stole my bike."', options: null, correct_answer: 'My bike was stolen.', ruleKey: 'passive', exampleSentence: 'My bike was stolen.', sampleWrongSentence: 'Someone stole my bike.' }),
    ],
    advanced: [
      b({ type: 'short_answer', question: 'Passive: "They will announce the results tomorrow."', options: null, correct_answer: 'The results will be announced tomorrow.', ruleKey: 'passive', exampleSentence: 'The results will be announced tomorrow.', sampleWrongSentence: 'They will announce the results tomorrow.' }),
      b({ type: 'correction', question: 'Fix: "The cake was ate by the children."', options: null, correct_answer: 'The cake was eaten by the children.', ruleKey: 'passive', exampleSentence: 'The cake was eaten by the children.', sampleWrongSentence: 'The cake was ate by the children.' }),
    ],
  }),
  reported_speech: topic({
    beginner: [
      b({ type: 'mcq', question: 'Direct: "I am tired," she said. → Reported:', options: ['She said she is tired.', 'She said she was tired.', 'She said I was tired.'], correct_answer: 'She said she was tired.', ruleKey: 'reported_speech', exampleSentence: 'She said she was tired.', sampleWrongSentence: 'She said she is tired.' }),
      b({ type: 'fill_blank', question: 'He told me he ___ (live) in Berlin.', options: null, correct_answer: 'lived', ruleKey: 'reported_speech', exampleSentence: 'He told me he lived in Berlin.', sampleWrongSentence: 'He told me he lives in Berlin.' }),
    ],
    intermediate: [
      b({ type: 'correction', question: 'Fix: "She said that she will call me."', options: null, correct_answer: 'She said that she would call me.', ruleKey: 'reported_speech', exampleSentence: 'She said that she would call me.', sampleWrongSentence: 'She said that she will call me.' }),
      b({ type: 'rewrite', question: 'Report: "Where do you work?" he asked.', options: null, correct_answer: 'He asked where I worked.', ruleKey: 'reported_speech', exampleSentence: 'He asked where I worked.', sampleWrongSentence: 'He asked where do I work.' }),
    ],
    advanced: [
      b({ type: 'short_answer', question: 'Report: "I have finished," she said.', options: null, correct_answer: 'She said she had finished.', ruleKey: 'reported_speech', exampleSentence: 'She said she had finished.', sampleWrongSentence: 'She said she has finished.' }),
      b({ type: 'correction', question: 'Fix: "He told me don\'t worry."', options: null, correct_answer: 'He told me not to worry.', ruleKey: 'reported_speech', exampleSentence: 'He told me not to worry.', sampleWrongSentence: 'He told me don\'t worry.' }),
    ],
  }),
  perfect_tenses: topic({
    beginner: [
      b({ type: 'mcq', question: 'Choose: "I ___ this movie three times."', options: ['saw', 'have seen', 'had seen'], correct_answer: 'have seen', ruleKey: 'perfect_tense', exampleSentence: 'I have seen this movie three times.', sampleWrongSentence: 'I saw this movie three times.' }),
      b({ type: 'fill_blank', question: 'She ___ (work) here since 2018.', options: null, correct_answer: 'has worked', ruleKey: 'perfect_tense', exampleSentence: 'She has worked here since 2018.', sampleWrongSentence: 'She works here since 2018.' }),
    ],
    intermediate: [
      b({ type: 'correction', question: 'Fix: "I have seen him yesterday."', options: null, correct_answer: 'I saw him yesterday.', ruleKey: 'verb_tense', exampleSentence: 'I saw him yesterday.', sampleWrongSentence: 'I have seen him yesterday.' }),
      b({ type: 'rewrite', question: 'Rewrite: "After I finished dinner, I watched TV." (use past perfect)', options: null, correct_answer: 'After I had finished dinner, I watched TV.', ruleKey: 'perfect_tense', exampleSentence: 'After I had finished dinner, I watched TV.', sampleWrongSentence: 'After I finished dinner, I watched TV.' }),
    ],
    advanced: [
      b({ type: 'fill_blank', question: 'They ___ (work) on this project since January.', options: null, correct_answer: 'have been working', ruleKey: 'perfect_tense', exampleSentence: 'They have been working on this project since January.', sampleWrongSentence: 'They work on this project since January.' }),
      b({ type: 'mcq', question: 'Choose: "This is the first time I ___ sushi."', options: ['try', 'tried', 'have tried'], correct_answer: 'have tried', ruleKey: 'perfect_tense', exampleSentence: 'This is the first time I have tried sushi.', sampleWrongSentence: 'This is the first time I try sushi.' }),
    ],
  }),
  connectors: topic({
    beginner: [
      b({ type: 'mcq', question: 'Choose: "___ it was raining, we went for a walk."', options: ['Although', 'Because', 'So'], correct_answer: 'Although', ruleKey: 'connector', exampleSentence: 'Although it was raining, we went for a walk.', sampleWrongSentence: 'Because it was raining, we went for a walk.' }),
      b({ type: 'fill_blank', question: 'She stayed home ___ she was feeling unwell.', options: null, correct_answer: 'because', ruleKey: 'connector', exampleSentence: 'She stayed home because she was feeling unwell.', sampleWrongSentence: 'She stayed home so she was feeling unwell.' }),
    ],
    intermediate: [
      b({ type: 'correction', question: 'Fix: "He studied hard, he passed the exam."', options: null, correct_answer: 'He studied hard, so he passed the exam.', ruleKey: 'connector', exampleSentence: 'He studied hard, so he passed the exam.', sampleWrongSentence: 'He studied hard, he passed the exam.' }),
      b({ type: 'rewrite', question: 'Join with "however": "The plan was good. It was too expensive."', options: null, correct_answer: 'The plan was good; however, it was too expensive.', ruleKey: 'connector', exampleSentence: 'The plan was good; however, it was too expensive.', sampleWrongSentence: 'The plan was good. It was too expensive.' }),
    ],
    advanced: [
      b({ type: 'correction', question: 'Fix: "Despite of the rain, the event continued."', options: null, correct_answer: 'Despite the rain, the event continued.', ruleKey: 'connector', exampleSentence: 'Despite the rain, the event continued.', sampleWrongSentence: 'Despite of the rain, the event continued.' }),
      b({ type: 'mcq', question: 'Choose: "We need to leave now; ___, we\'ll miss the train."', options: ['otherwise', 'moreover', 'for example'], correct_answer: 'otherwise', ruleKey: 'connector', exampleSentence: 'We need to leave now; otherwise, we\'ll miss the train.', sampleWrongSentence: 'We need to leave now; moreover, we\'ll miss the train.' }),
    ],
  }),
};

/** Default fallback topic when a level has no blueprints yet. */
export const DEFAULT_AI_TOPIC: GrammarTopic = 'articles';
