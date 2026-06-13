/**
 * Generates grammar exercise JSON for all topics.
 * Run: node scripts/generate-grammar-content.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONTENT_ROOT = path.join(__dirname, '../src/grammar-practice/content');

const EXERCISES = {
  beginner: {
    articles: [
      { type: 'fill_blank', question: 'I have ___ cat at home.', options: null, correct_answer: 'a', explanation: 'Use "a" before consonant sounds. "Cat" starts with a consonant sound. Example: I have a dog too.' },
      { type: 'mcq', question: 'Choose the correct article: ___ apple', options: ['a', 'an', 'the'], correct_answer: 'an', explanation: 'Use "an" before vowel sounds. Example: She ate an orange after lunch.' },
      { type: 'correction', question: 'Fix the sentence: "He is a engineer."', options: null, correct_answer: 'He is an engineer.', explanation: 'Use "an" before vowel sounds. "Engineer" starts with a vowel sound.' },
      { type: 'fill_blank', question: 'She bought ___ umbrella because it was raining.', options: null, correct_answer: 'an', explanation: 'Use "an" before vowel sounds. Example: He needs an umbrella today.' },
      { type: 'mcq', question: 'Which sentence is correct?', options: ['I saw a dog in the park.', 'I saw an dog in the park.', 'I saw dog in the park.'], correct_answer: 'I saw a dog in the park.', explanation: 'Countable singular nouns need an article. Use "a" before consonant sounds.' },
      { type: 'rewrite', question: 'Add the correct article: "I want book."', options: null, correct_answer: 'I want a book.', explanation: 'Use "a" before consonant sounds when the noun is singular and countable.' },
      { type: 'fill_blank', question: 'It is ___ honest answer.', options: null, correct_answer: 'an', explanation: '"Honest" starts with a vowel sound, so we use "an". Example: That was an honest reply.' },
      { type: 'correction', question: 'Fix: "We ate an banana."', options: null, correct_answer: 'We ate a banana.', explanation: 'Use "a" before consonant sounds and "an" before vowel sounds.' },
      { type: 'short_answer', question: 'Fill in one word: "She is ___ artist."', options: null, correct_answer: 'an', explanation: 'Use "an" before vowel sounds. Example: He is an actor.' },
      { type: 'mcq', question: 'Choose the correct article: ___ university student', options: ['a', 'an', 'the'], correct_answer: 'a', explanation: '"University" starts with a "y" consonant sound, so we use "a".' },
    ],
    simple_present: [
      { type: 'fill_blank', question: 'She ___ (walk) to school every day.', options: null, correct_answer: 'walks', explanation: 'Add -s to the verb with he/she/it in the simple present. Example: He walks to work.' },
      { type: 'mcq', question: 'Choose the correct form: "They ___ coffee in the morning."', options: ['drink', 'drinks', 'drinking'], correct_answer: 'drink', explanation: 'Use the base verb with they/we/I/you in the simple present.' },
      { type: 'correction', question: 'Fix: "He go to the gym on Mondays."', options: null, correct_answer: 'He goes to the gym on Mondays.', explanation: 'Add -s with he/she/it in the simple present.' },
      { type: 'fill_blank', question: 'I ___ (study) English three times a week.', options: null, correct_answer: 'study', explanation: 'Use the base verb with I/you/we/they. Example: We study together.' },
      { type: 'rewrite', question: 'Rewrite correctly: "My brother watch TV every evening."', options: null, correct_answer: 'My brother watches TV every evening.', explanation: 'Add -es after verbs ending in ch/sh/s/x with he/she/it.' },
      { type: 'mcq', question: 'Which sentence is correct?', options: ['She doesn\'t like spicy food.', 'She don\'t like spicy food.', 'She not like spicy food.'], correct_answer: 'She doesn\'t like spicy food.', explanation: 'Use doesn\'t + base verb with he/she/it in negative simple present.' },
      { type: 'fill_blank', question: 'The shop ___ (open) at 9 AM.', options: null, correct_answer: 'opens', explanation: 'Add -s with he/she/it for facts and routines. Example: The train leaves at noon.' },
      { type: 'correction', question: 'Fix: "Do she live here?"', options: null, correct_answer: 'Does she live here?', explanation: 'Use does (not do) with he/she/it in questions.' },
      { type: 'short_answer', question: 'Complete: "We ___ (play) soccer on Saturdays."', options: null, correct_answer: 'play', explanation: 'Use the base verb with we in the simple present.' },
      { type: 'mcq', question: 'Choose: "It ___ a lot in winter."', options: ['rain', 'rains', 'raining'], correct_answer: 'rains', explanation: 'Add -s with it/he/she for general truths and routines.' },
    ],
    simple_past: [
      { type: 'fill_blank', question: 'Yesterday, I ___ (walk) to the store.', options: null, correct_answer: 'walked', explanation: 'Regular verbs form the past tense by adding -ed. Example: She played tennis.' },
      { type: 'mcq', question: 'Choose the correct form: "Last week, they ___ football."', options: ['play', 'played', 'playing'], correct_answer: 'played', explanation: 'Use the past tense when the sentence refers to a finished time.' },
      { type: 'correction', question: 'Fix: "He visit his grandma last Sunday."', options: null, correct_answer: 'He visited his grandma last Sunday.', explanation: 'Regular verbs form the past tense by adding -ed.' },
      { type: 'fill_blank', question: 'We ___ (watch) a movie last night.', options: null, correct_answer: 'watched', explanation: 'Use the past tense with finished time words like "last night".' },
      { type: 'rewrite', question: 'Rewrite in past tense: "She cleans the room an hour ago."', options: null, correct_answer: 'She cleaned the room an hour ago.', explanation: 'Use the past tense with "ago". Regular verbs add -ed.' },
      { type: 'mcq', question: 'Which sentence is correct?', options: ['I studied for the test yesterday.', 'I study for the test yesterday.', 'I studying for the test yesterday.'], correct_answer: 'I studied for the test yesterday.', explanation: 'Use the past tense when the sentence refers to a finished time.' },
      { type: 'fill_blank', question: 'They ___ (talk) about the trip last week.', options: null, correct_answer: 'talked', explanation: 'Regular verbs form the past tense by adding -ed.' },
      { type: 'correction', question: 'Fix: "We don\'t went to the party."', options: null, correct_answer: 'We didn\'t go to the party.', explanation: 'Use didn\'t + base verb in the past negative, not the past form twice.' },
      { type: 'short_answer', question: 'Past tense of "help": "They ___ me yesterday."', options: null, correct_answer: 'helped', explanation: 'Regular verbs form the past tense by adding -ed.' },
      { type: 'mcq', question: 'Choose: "She ___ her keys at home this morning."', options: ['leave', 'left', 'leaving'], correct_answer: 'left', explanation: 'Some verbs are irregular. "Leave" becomes "left" in the past tense.' },
    ],
    prepositions: [
      { type: 'mcq', question: 'Choose: "I was born ___ 2005."', options: ['in', 'on', 'at'], correct_answer: 'in', explanation: 'Use "in" for years. Example: She was born in 2010.' },
      { type: 'fill_blank', question: 'We have class ___ Monday.', options: null, correct_answer: 'on', explanation: 'Use "on" for days and dates. Example: I work on Friday.' },
      { type: 'correction', question: 'Fix: "School starts in 9 AM."', options: null, correct_answer: 'School starts at 9 AM.', explanation: 'Use "at" for specific times. Example: I wake up at 7 AM.' },
      { type: 'mcq', question: 'Which sentence is correct?', options: ['I study at 7 PM.', 'I study in 7 PM.', 'I study on 7 PM.'], correct_answer: 'I study at 7 PM.', explanation: 'Use "at" for specific times.' },
      { type: 'fill_blank', question: 'She goes jogging ___ Sunday mornings.', options: null, correct_answer: 'on', explanation: 'Use "on" for days. Example: We rest on Sundays.' },
      { type: 'rewrite', question: 'Rewrite: "My birthday is in July 15."', options: null, correct_answer: 'My birthday is on July 15.', explanation: 'Use "on" for days and dates.' },
      { type: 'fill_blank', question: 'They moved here ___ 2020.', options: null, correct_answer: 'in', explanation: 'Use "in" for years and months. Example: We travel in December.' },
      { type: 'correction', question: 'Fix: "I have class at Monday."', options: null, correct_answer: 'I have class on Monday.', explanation: 'Use "on" for days and dates.' },
      { type: 'short_answer', question: 'Fill in one word: "The concert is ___ Friday evening."', options: null, correct_answer: 'on', explanation: 'Use "on" for days and dates.' },
      { type: 'mcq', question: 'Choose: "The shop opens ___ noon."', options: ['in', 'on', 'at'], correct_answer: 'at', explanation: 'Use "at" for specific times like noon.' },
    ],
    subject_verb: [
      { type: 'correction', question: 'Fix: "Go to school every day."', options: null, correct_answer: 'I go to school every day.', explanation: 'Your sentence needs a subject to be complete. Example: I go to school every day.' },
      { type: 'mcq', question: 'Which sentence has correct subject-verb agreement?', options: ['She like music.', 'She likes music.', 'She liking music.'], correct_answer: 'She likes music.', explanation: 'Add -s to the verb with he/she/it in the simple present.' },
      { type: 'fill_blank', question: 'My friends ___ (be) from Brazil.', options: null, correct_answer: 'are', explanation: 'Use "are" with plural subjects. Example: They are students.' },
      { type: 'correction', question: 'Fix: "The dogs runs fast."', options: null, correct_answer: 'The dogs run fast.', explanation: 'Use the base verb with plural subjects. Do not add -s.' },
      { type: 'rewrite', question: 'Rewrite with a subject: "Is happy today."', options: null, correct_answer: 'She is happy today.', explanation: 'Every complete sentence needs a subject. Example: He is happy today.' },
      { type: 'mcq', question: 'Choose the correct verb: "He ___ a teacher."', options: ['are', 'is', 'am'], correct_answer: 'is', explanation: 'Use "is" with he/she/it. Example: She is a doctor.' },
      { type: 'fill_blank', question: 'The children ___ (play) in the yard.', options: null, correct_answer: 'play', explanation: 'Use the base verb with plural subjects like "children".' },
      { type: 'correction', question: 'Fix: "Maria and Tom goes to the same school."', options: null, correct_answer: 'Maria and Tom go to the same school.', explanation: 'Compound subjects take a plural verb. Use "go", not "goes".' },
      { type: 'short_answer', question: 'Complete: "It ___ (be) cold outside."', options: null, correct_answer: 'is', explanation: 'Use "is" with it/he/she. Example: It is sunny today.' },
      { type: 'mcq', question: 'Which sentence is complete?', options: ['Walks in the park.', 'She walks in the park.', 'Walking in the park.'], correct_answer: 'She walks in the park.', explanation: 'A complete sentence needs a subject and a verb.' },
    ],
    basic_structure: [
      { type: 'correction', question: 'Fix word order: "Every day to work I go."', options: null, correct_answer: 'I go to work every day.', explanation: 'English usually follows subject + verb + object order. Example: She reads books.' },
      { type: 'mcq', question: 'Which is a complete sentence?', options: ['Because it was raining.', 'It was raining.', 'Raining hard.'], correct_answer: 'It was raining.', explanation: 'A complete sentence has a subject and a verb. Fragments are incomplete.' },
      { type: 'rewrite', question: 'Combine into one sentence: "She is tired. She went to bed early."', options: null, correct_answer: 'She was tired, so she went to bed early.', explanation: 'Connect related ideas clearly. Example: I was hungry, so I ate lunch.' },
      { type: 'fill_blank', question: 'Complete: "My sister ___ a doctor."', options: null, correct_answer: 'is', explanation: 'A basic sentence needs subject + verb + complement. Example: My brother is a teacher.' },
      { type: 'correction', question: 'Fix the fragment: "Running in the park."', options: null, correct_answer: 'She is running in the park.', explanation: 'Add a subject and helping verb to make the sentence complete.' },
      { type: 'mcq', question: 'Which sentence is correct?', options: ['I very like this song.', 'I like this song very much.', 'I like very this song.'], correct_answer: 'I like this song very much.', explanation: 'Place adverbs like "very much" after the object in simple sentences.' },
      { type: 'rewrite', question: 'Rewrite as a question: "You live in London."', options: null, correct_answer: 'Do you live in London?', explanation: 'Start yes/no questions with do/does + subject + base verb.' },
      { type: 'fill_blank', question: 'Complete: "There ___ two books on the table."', options: null, correct_answer: 'are', explanation: 'Use "there are" with plural nouns. Example: There are three chairs.' },
      { type: 'correction', question: 'Fix the run-on: "I woke up I made coffee."', options: null, correct_answer: 'I woke up and made coffee.', explanation: 'Connect two actions with "and" or split into two sentences.' },
      { type: 'short_answer', question: 'Add a subject and verb: "___ happy today."', options: null, correct_answer: 'I am happy today.', explanation: 'Every sentence needs a subject and verb. Example: We are happy today.' },
    ],
  },
  intermediate: {
    present_vs_continuous: [
      { type: 'mcq', question: 'Choose: "I usually ___ tea, but today I ___ coffee."', options: ['drink / am drinking', 'am drinking / drink', 'drinks / am drinking'], correct_answer: 'drink / am drinking', explanation: 'Use simple present for habits and present continuous for actions happening now.' },
      { type: 'fill_blank', question: 'Listen! The baby ___ (cry).', options: null, correct_answer: 'is crying', explanation: 'Use present continuous for something happening at this moment. Example: Look! It is raining.' },
      { type: 'correction', question: 'Fix: "She is knowing the answer."', options: null, correct_answer: 'She knows the answer.', explanation: 'Stative verbs like "know" are not usually used in continuous forms.' },
      { type: 'mcq', question: 'Which sentence is correct?', options: ['He works at a bank.', 'He is working at a bank every day.', 'He work at a bank.'], correct_answer: 'He works at a bank.', explanation: 'Use simple present for permanent jobs and routines.' },
      { type: 'rewrite', question: 'Rewrite: "They play soccer now." (action in progress)', options: null, correct_answer: 'They are playing soccer now.', explanation: 'Use present continuous with "now" for actions in progress.' },
      { type: 'fill_blank', question: 'She ___ (not work) today because she is sick.', options: null, correct_answer: 'is not working', explanation: 'Use present continuous for a temporary situation today.' },
      { type: 'correction', question: 'Fix: "I am living here since 2019."', options: null, correct_answer: 'I have lived here since 2019.', explanation: 'Use present perfect with "since" for duration from past to now, not present continuous.' },
      { type: 'mcq', question: 'Choose: "What ___ you ___ at the moment?"', options: ['do / do', 'are / doing', 'did / do'], correct_answer: 'are / doing', explanation: 'Use present continuous with "at the moment".' },
      { type: 'short_answer', question: 'Complete: "The sun ___ (rise) in the east." (general truth)', options: null, correct_answer: 'rises', explanation: 'Use simple present for general truths and facts.' },
      { type: 'rewrite', question: 'Rewrite: "He is always complain about the weather."', options: null, correct_answer: 'He is always complaining about the weather.', explanation: 'Use always + present continuous to show annoyance about repeated behavior.' },
    ],
    past_vs_continuous: [
      { type: 'mcq', question: 'Choose: "While I ___, the phone ___."', options: ['was cooking / rang', 'cooked / was ringing', 'was cooking / was ringing'], correct_answer: 'was cooking / rang', explanation: 'Past continuous for ongoing action; past simple for the interruption.' },
      { type: 'fill_blank', question: 'They ___ (watch) TV when the power went out.', options: null, correct_answer: 'were watching', explanation: 'Use past continuous for an action in progress when something else happened.' },
      { type: 'correction', question: 'Fix: "I was walk home when it started raining."', options: null, correct_answer: 'I was walking home when it started raining.', explanation: 'Use was/were + verb-ing for past continuous.' },
      { type: 'mcq', question: 'Which sentence is correct?', options: ['She was studying at 8 PM yesterday.', 'She studied at 8 PM yesterday for two hours.', 'She was study at 8 PM yesterday.'], correct_answer: 'She was studying at 8 PM yesterday.', explanation: 'Use past continuous for an action in progress at a specific past time.' },
      { type: 'rewrite', question: 'Rewrite: "He broke his leg while he skied."', options: null, correct_answer: 'He broke his leg while he was skiing.', explanation: 'Use past continuous for the longer background action.' },
      { type: 'fill_blank', question: 'What ___ you ___ (do) at this time last year?', options: null, correct_answer: 'were, doing', explanation: 'Use past continuous for an action at a specific past time.' },
      { type: 'correction', question: 'Fix: "When I arrived, they were already leave."', options: null, correct_answer: 'When I arrived, they had already left.', explanation: 'Use past perfect for an action completed before another past action.' },
      { type: 'mcq', question: 'Choose: "I ___ to Rome in 2019."', options: ['was going', 'went', 'have gone'], correct_answer: 'went', explanation: 'Use past simple with a finished past time like "in 2019".' },
      { type: 'short_answer', question: 'Complete: "It ___ (rain) all day yesterday."', options: null, correct_answer: 'was raining', explanation: 'Past continuous can describe weather over a period in the past.' },
      { type: 'rewrite', question: 'Rewrite: "As she walked, she was listening to music." → swap emphasis to continuous background', options: null, correct_answer: 'She was walking as she listened to music.', explanation: 'Both actions can use past continuous/simple depending on which is background.' },
    ],
    countable_uncountable: [
      { type: 'mcq', question: 'Choose: "How ___ apples do you need?"', options: ['much', 'many', 'lot'], correct_answer: 'many', explanation: 'Use "many" with countable plural nouns. Example: How many books do you have?' },
      { type: 'fill_blank', question: 'There isn\'t ___ sugar left.', options: null, correct_answer: 'much', explanation: 'Use "much" with uncountable nouns in negative sentences.' },
      { type: 'correction', question: 'Fix: "Can I have a informations?"', options: null, correct_answer: 'Can I have some information?', explanation: '"Information" is uncountable. Use "some", not "a/an".' },
      { type: 'mcq', question: 'Which is correct?', options: ['a piece of advice', 'an advice', 'advices'], correct_answer: 'a piece of advice', explanation: 'Use "a piece of" with uncountable nouns to count them.' },
      { type: 'rewrite', question: 'Rewrite: "I need two bread for dinner."', options: null, correct_answer: 'I need two loaves of bread for dinner.', explanation: '"Bread" is uncountable. Use a unit like "loaves of bread".' },
      { type: 'fill_blank', question: 'She has ___ friends in this city.', options: null, correct_answer: 'many', explanation: 'Use "many" with countable plural nouns like "friends".' },
      { type: 'correction', question: 'Fix: "How much people came to the event?"', options: null, correct_answer: 'How many people came to the event?', explanation: 'Use "many" with countable nouns like "people".' },
      { type: 'mcq', question: 'Choose: "I don\'t have ___ time today."', options: ['many', 'much', 'a'], correct_answer: 'much', explanation: 'Use "much" with uncountable nouns like "time".' },
      { type: 'short_answer', question: 'Complete: "Would you like ___ water?"', options: null, correct_answer: 'some', explanation: 'Use "some" in offers with uncountable and plural countable nouns.' },
      { type: 'fill_blank', question: 'There are ___ chairs in the room.', options: null, correct_answer: 'a few', explanation: 'Use "a few" with countable plural nouns. Example: a few students.' },
    ],
    comparatives: [
      { type: 'fill_blank', question: 'This book is ___ (interesting) than that one.', options: null, correct_answer: 'more interesting', explanation: 'Use "more + adjective" for long adjectives in comparatives.' },
      { type: 'mcq', question: 'Choose: "She is ___ than her brother."', options: ['tall', 'taller', 'more tall'], correct_answer: 'taller', explanation: 'Add -er to short adjectives for comparatives. Example: faster, bigger.' },
      { type: 'correction', question: 'Fix: "Today is more cold than yesterday."', options: null, correct_answer: 'Today is colder than yesterday.', explanation: 'One-syllable adjectives usually take -er, not "more".' },
      { type: 'rewrite', question: 'Rewrite: "This phone is not as good as the new one."', options: null, correct_answer: 'The new phone is better than this one.', explanation: 'Comparatives can express the same idea as "not as...as".' },
      { type: 'fill_blank', question: 'He runs ___ (fast) than anyone on the team.', options: null, correct_answer: 'faster', explanation: 'Add -er to "fast" for the comparative form.' },
      { type: 'mcq', question: 'Which is correct?', options: ['more easier', 'easier', 'easyer'], correct_answer: 'easier', explanation: 'Adjectives ending in -y change to -ier: easy → easier.' },
      { type: 'correction', question: 'Fix: "This exercise is more harder than the last one."', options: null, correct_answer: 'This exercise is harder than the last one.', explanation: 'Do not use "more" and -er together.' },
      { type: 'short_answer', question: 'Comparative of "good": "This result is ___ than before."', options: null, correct_answer: 'better', explanation: '"Good" has an irregular comparative: better.' },
      { type: 'fill_blank', question: 'The second option is ___ (expensive) of the two.', options: null, correct_answer: 'more expensive', explanation: 'Use "more + adjective" for comparatives with long adjectives.' },
      { type: 'mcq', question: 'Choose: "My room is ___ than yours."', options: ['more clean', 'cleaner', 'cleanner'], correct_answer: 'cleaner', explanation: 'Short adjectives form comparatives with -er.' },
    ],
    modals: [
      { type: 'mcq', question: 'Choose: "You ___ wear a seatbelt in the car." (rule)', options: ['can', 'must', 'might'], correct_answer: 'must', explanation: 'Use "must" for rules and strong obligation.' },
      { type: 'fill_blank', question: 'She ___ (can) speak three languages.', options: null, correct_answer: 'can', explanation: 'Use "can" for ability. Example: I can swim.' },
      { type: 'correction', question: 'Fix: "You should to study more."', options: null, correct_answer: 'You should study more.', explanation: 'Modal verbs are followed by the base verb without "to".' },
      { type: 'rewrite', question: 'Rewrite with "should": "It\'s a good idea to rest."', options: null, correct_answer: 'You should rest.', explanation: 'Use "should" for advice. Example: You should drink water.' },
      { type: 'mcq', question: 'Choose: "It ___ rain later, so take an umbrella."', options: ['must', 'might', 'can\'t'], correct_answer: 'might', explanation: 'Use "might" for possible future events.' },
      { type: 'fill_blank', question: 'You ___ (not) smoke here. It\'s forbidden.', options: null, correct_answer: 'must not', explanation: 'Use "must not" for prohibition. Example: You must not park here.' },
      { type: 'correction', question: 'Fix: "He can to drive a truck."', options: null, correct_answer: 'He can drive a truck.', explanation: 'After modals, use the base verb without "to".' },
      { type: 'mcq', question: 'Which expresses permission?', options: ['You may leave early today.', 'You must leave early today.', 'You should leave early today.'], correct_answer: 'You may leave early today.', explanation: 'Use "may" to give permission politely.' },
      { type: 'short_answer', question: 'Complete: "I ___ (have to) finish this today."', options: null, correct_answer: 'have to', explanation: 'Use "have to" for external obligation. Example: I have to work tomorrow.' },
      { type: 'rewrite', question: 'Rewrite: "It\'s impossible that he is at home now."', options: null, correct_answer: 'He can\'t be at home now.', explanation: 'Use "can\'t" for strong negative possibility.' },
    ],
    adverbs: [
      { type: 'fill_blank', question: 'She speaks English ___. (fluent)', options: null, correct_answer: 'fluently', explanation: 'Add -ly to form adverbs from adjectives. Example: quick → quickly.' },
      { type: 'mcq', question: 'Choose the correct word order:', options: ['She always is late.', 'She is always late.', 'Always she is late.'], correct_answer: 'She is always late.', explanation: 'Place frequency adverbs before the main verb but after "be".' },
      { type: 'correction', question: 'Fix: "He drives careful on highways."', options: null, correct_answer: 'He drives carefully on highways.', explanation: 'Use an adverb to describe how someone drives.' },
      { type: 'rewrite', question: 'Rewrite with an adverb: "She is a quick runner."', options: null, correct_answer: 'She runs quickly.', explanation: 'Adverbs describe verbs. Example: He speaks clearly.' },
      { type: 'fill_blank', question: 'I ___ (recent) started learning French.', options: null, correct_answer: 'recently', explanation: 'Use "recently" before the main verb for time. Example: I recently moved here.' },
      { type: 'mcq', question: 'Which is correct?', options: ['He works hard.', 'He works hardly.', 'He hard works.'], correct_answer: 'He works hard.', explanation: '"Hard" can be an adverb meaning "with effort". "Hardly" means "almost not".' },
      { type: 'correction', question: 'Fix: "She sings beautiful."', options: null, correct_answer: 'She sings beautifully.', explanation: 'Use -ly adverbs to describe how someone sings.' },
      { type: 'short_answer', question: 'Adverb form of "slow": "Please walk ___.""', options: null, correct_answer: 'slowly', explanation: 'Add -ly to many adjectives to form adverbs.' },
      { type: 'fill_blank', question: 'They ___ (complete) forgot about the meeting.', options: null, correct_answer: 'completely', explanation: 'Adverbs like "completely" modify verbs. Example: I totally agree.' },
      { type: 'mcq', question: 'Choose: "He is ___ good at math."', options: ['very', 'veryly', 'much very'], correct_answer: 'very', explanation: 'Use "very" to modify adjectives, not adverbs with -ly.' },
    ],
  },
  advanced: {
    conditionals: [
      { type: 'mcq', question: 'Choose (zero conditional): "If you heat ice, it ___."', options: ['will melt', 'melts', 'melted'], correct_answer: 'melts', explanation: 'Use present simple in both clauses for general truths.' },
      { type: 'fill_blank', question: 'If it rains tomorrow, we ___ (cancel) the picnic.', options: null, correct_answer: 'will cancel', explanation: 'First conditional: if + present, will + base verb for real future possibilities.' },
      { type: 'correction', question: 'Fix: "If I would have time, I would travel more."', options: null, correct_answer: 'If I had time, I would travel more.', explanation: 'Second conditional uses if + past simple, would + base verb.' },
      { type: 'rewrite', question: 'Rewrite (third conditional): "I didn\'t study, so I failed."', options: null, correct_answer: 'If I had studied, I would have passed.', explanation: 'Third conditional: if + past perfect, would have + past participle.' },
      { type: 'mcq', question: 'Choose: "If she ___ earlier, she wouldn\'t miss the train."', options: ['leaves', 'left', 'had left'], correct_answer: 'left', explanation: 'Second conditional uses past simple in the if-clause.' },
      { type: 'fill_blank', question: 'Unless you ___ (hurry), you\'ll be late.', options: null, correct_answer: 'hurry', explanation: '"Unless" means "if not". Use present simple in first conditional.' },
      { type: 'correction', question: 'Fix: "If I will see him, I tell him."', options: null, correct_answer: 'If I see him, I will tell him.', explanation: 'Do not use "will" in the if-clause of first conditional.' },
      { type: 'short_answer', question: 'Complete (second conditional): "If I ___ (be) you, I\'d accept the offer."', options: null, correct_answer: 'were', explanation: 'Use "were" for all persons in formal second conditional with "to be".' },
      { type: 'mcq', question: 'Which expresses an unreal past situation?', options: ['If I had known, I would have helped.', 'If I know, I will help.', 'If I knew, I would help.'], correct_answer: 'If I had known, I would have helped.', explanation: 'Third conditional refers to unreal past situations.' },
      { type: 'rewrite', question: 'Rewrite with "provided that": "You can go out if you finish your homework."', options: null, correct_answer: 'You can go out provided that you finish your homework.', explanation: '"Provided that" works like "if" for conditions.' },
    ],
    relative_clauses: [
      { type: 'fill_blank', question: 'The woman ___ lives next door is a doctor.', options: null, correct_answer: 'who', explanation: 'Use "who" for people in defining relative clauses.' },
      { type: 'mcq', question: 'Choose: "This is the book ___ I recommended."', options: ['who', 'which', 'where'], correct_answer: 'which', explanation: 'Use "which" or "that" for things.' },
      { type: 'correction', question: 'Fix: "The man which called you is my uncle."', options: null, correct_answer: 'The man who called you is my uncle.', explanation: 'Use "who" for people, not "which".' },
      { type: 'rewrite', question: 'Combine: "I met a student. She speaks five languages."', options: null, correct_answer: 'I met a student who speaks five languages.', explanation: 'Relative clauses add information about a noun.' },
      { type: 'fill_blank', question: 'That\'s the restaurant ___ we had dinner.', options: null, correct_answer: 'where', explanation: 'Use "where" for places.' },
      { type: 'mcq', question: 'Which is correct?', options: ['The person to whom I spoke was helpful.', 'The person who I spoke to was helpful.', 'Both are acceptable in modern English.'], correct_answer: 'Both are acceptable in modern English.', explanation: 'Formal English uses "whom"; everyday English often ends with a preposition.' },
      { type: 'correction', question: 'Fix: "The reason because he left is unclear."', options: null, correct_answer: 'The reason why he left is unclear.', explanation: 'Use "why" (or "that") after "reason", not "because".' },
      { type: 'short_answer', question: 'Complete: "The film ___ we watched was excellent."', options: null, correct_answer: 'that', explanation: 'Use "that" or "which" for things. "That" is common in defining clauses.' },
      { type: 'rewrite', question: 'Combine with a non-defining clause: "My brother, he lives in Canada, is visiting."', options: null, correct_answer: 'My brother, who lives in Canada, is visiting.', explanation: 'Non-defining clauses use commas and "who" for extra information.' },
      { type: 'fill_blank', question: 'The day ___ we met was sunny.', options: null, correct_answer: 'when', explanation: 'Use "when" for time expressions in relative clauses.' },
    ],
    passive_voice: [
      { type: 'mcq', question: 'Choose the passive form: "They build houses here."', options: ['Houses are built here.', 'Houses is built here.', 'Houses were build here.'], correct_answer: 'Houses are built here.', explanation: 'Passive: subject + be + past participle. Example: English is spoken here.' },
      { type: 'fill_blank', question: 'The report ___ (finish) yesterday.', options: null, correct_answer: 'was finished', explanation: 'Past passive: was/were + past participle.' },
      { type: 'correction', question: 'Fix: "The window was break by the ball."', options: null, correct_answer: 'The window was broken by the ball.', explanation: 'Use the past participle, not the past tense, in passive voice.' },
      { type: 'rewrite', question: 'Rewrite in passive: "Someone stole my bike."', options: null, correct_answer: 'My bike was stolen.', explanation: 'The object becomes the subject in passive voice.' },
      { type: 'mcq', question: 'Choose: "English ___ all over the world."', options: ['speaks', 'is spoken', 'is speaking'], correct_answer: 'is spoken', explanation: 'Use passive when the action is more important than who does it.' },
      { type: 'fill_blank', question: 'The meeting ___ (cancel) due to the storm.', options: null, correct_answer: 'was cancelled', explanation: 'Past passive with was + past participle.' },
      { type: 'correction', question: 'Fix: "The cake was ate by the children."', options: null, correct_answer: 'The cake was eaten by the children.', explanation: 'Use the past participle "eaten", not "ate".' },
      { type: 'short_answer', question: 'Passive of "They will announce the results tomorrow."', options: null, correct_answer: 'The results will be announced tomorrow.', explanation: 'Future passive: will be + past participle.' },
      { type: 'rewrite', question: 'Rewrite in active voice: "The letter was written by Maria."', options: null, correct_answer: 'Maria wrote the letter.', explanation: 'Active voice: subject performs the action.' },
      { type: 'mcq', question: 'Choose: "This problem needs ___ carefully."', options: ['to handle', 'handling', 'being handle'], correct_answer: 'handling', explanation: 'Some passive-like structures use need + -ing. Example: The car needs washing.' },
    ],
    reported_speech: [
      { type: 'mcq', question: 'Choose: Direct: "I am tired," she said. → Reported:', options: ['She said she is tired.', 'She said she was tired.', 'She said I was tired.'], correct_answer: 'She said she was tired.', explanation: 'Present simple usually shifts to past simple in reported speech.' },
      { type: 'fill_blank', question: 'He told me he ___ (live) in Berlin.', options: null, correct_answer: 'lived', explanation: 'Shift present to past when the reporting verb is past.' },
      { type: 'correction', question: 'Fix: "She said that she will call me."', options: null, correct_answer: 'She said that she would call me.', explanation: '"Will" becomes "would" in reported speech.' },
      { type: 'rewrite', question: 'Report: "Where do you work?" he asked.', options: null, correct_answer: 'He asked where I worked.', explanation: 'Remove question mark; use statement word order; shift tense.' },
      { type: 'mcq', question: 'Choose: "I can help you," he said. →', options: ['He said he can help me.', 'He said he could help me.', 'He said he could help you.'], correct_answer: 'He said he could help me.', explanation: '"Can" becomes "could"; pronouns may change.' },
      { type: 'fill_blank', question: 'She asked if I ___ (be) free on Friday.', options: null, correct_answer: 'was', explanation: 'Reported yes/no questions use if/whether and past tense.' },
      { type: 'correction', question: 'Fix: "He told me don\'t worry."', options: null, correct_answer: 'He told me not to worry.', explanation: 'Report imperatives with told/asked + object + (not) to + verb.' },
      { type: 'short_answer', question: 'Report: "I have finished," she said.', options: null, correct_answer: 'She said she had finished.', explanation: 'Present perfect shifts to past perfect in reported speech.' },
      { type: 'rewrite', question: 'Report: "We went to the beach yesterday," they said.', options: null, correct_answer: 'They said they had gone to the beach the day before.', explanation: 'Past simple can shift to past perfect; time words may change.' },
      { type: 'mcq', question: 'Choose: "Leave now," the teacher said. →', options: ['The teacher told us to leave then.', 'The teacher told us leave now.', 'The teacher said us to leave.'], correct_answer: 'The teacher told us to leave then.', explanation: 'Report commands with told + object + to-infinitive.' },
    ],
    perfect_tenses: [
      { type: 'mcq', question: 'Choose: "I ___ this movie three times."', options: ['saw', 'have seen', 'had seen'], correct_answer: 'have seen', explanation: 'Present perfect links past experience to now without a finished time.' },
      { type: 'fill_blank', question: 'She ___ (work) here since 2018.', options: null, correct_answer: 'has worked', explanation: 'Present perfect + since for actions continuing to now.' },
      { type: 'correction', question: 'Fix: "I have seen him yesterday."', options: null, correct_answer: 'I saw him yesterday.', explanation: 'Do not use present perfect with finished time words like "yesterday".' },
      { type: 'rewrite', question: 'Rewrite: "After I finished dinner, I watched TV." (use past perfect)', options: null, correct_answer: 'After I had finished dinner, I watched TV.', explanation: 'Past perfect shows the earlier of two past actions.' },
      { type: 'mcq', question: 'Choose: "By the time we arrived, the film ___."', options: ['started', 'has started', 'had started'], correct_answer: 'had started', explanation: 'Past perfect for an action before another past action.' },
      { type: 'fill_blank', question: 'They ___ (not finish) the project yet.', options: null, correct_answer: 'haven\'t finished', explanation: 'Present perfect with "yet" in negatives.' },
      { type: 'correction', question: 'Fix: "I am living here since 2020."', options: null, correct_answer: 'I have lived here since 2020.', explanation: 'Use present perfect with "since" for duration to now.' },
      { type: 'short_answer', question: 'Complete: "How long ___ you ___ (know) her?"', options: null, correct_answer: 'have, known', explanation: 'Present perfect for duration with "how long".' },
      { type: 'rewrite', question: 'Rewrite: "I started learning English in 2019 and I still learn it."', options: null, correct_answer: 'I have been learning English since 2019.', explanation: 'Present perfect continuous emphasizes ongoing activity.' },
      { type: 'mcq', question: 'Choose: "This is the first time I ___ sushi."', options: ['try', 'tried', 'have tried'], correct_answer: 'have tried', explanation: 'Present perfect often follows "This is the first time".' },
    ],
    connectors: [
      { type: 'mcq', question: 'Choose: "___ it was raining, we went for a walk."', options: ['Although', 'Because', 'So'], correct_answer: 'Although', explanation: '"Although" shows contrast between two ideas.' },
      { type: 'fill_blank', question: 'She stayed home ___ she was feeling unwell.', options: null, correct_answer: 'because', explanation: '"Because" introduces a reason. Example: I left early because I was tired.' },
      { type: 'correction', question: 'Fix: "He studied hard, he passed the exam."', options: null, correct_answer: 'He studied hard, so he passed the exam.', explanation: 'Connect related clauses with a connector like "so" or use two sentences.' },
      { type: 'rewrite', question: 'Join with "however": "The plan was good. It was too expensive."', options: null, correct_answer: 'The plan was good; however, it was too expensive.', explanation: '"However" shows contrast between sentences.' },
      { type: 'mcq', question: 'Choose: "I\'ll call you ___ I arrive."', options: ['while', 'as soon as', 'although'], correct_answer: 'as soon as', explanation: '"As soon as" means immediately when something happens.' },
      { type: 'fill_blank', question: '___ you practice regularly, you will improve.', options: null, correct_answer: 'If', explanation: '"If" introduces a condition. Example: If you rest, you\'ll feel better.' },
      { type: 'correction', question: 'Fix: "Despite of the rain, the event continued."', options: null, correct_answer: 'Despite the rain, the event continued.', explanation: 'Use "despite" without "of", or use "in spite of".' },
      { type: 'short_answer', question: 'Complete: "She not only sings ___ she also writes songs."', options: null, correct_answer: 'but', explanation: 'Use "not only... but also" to add information.' },
      { type: 'rewrite', question: 'Join: "The traffic was bad. We arrived on time." (use although)', options: null, correct_answer: 'Although the traffic was bad, we arrived on time.', explanation: '"Although" introduces a contrasting clause.' },
      { type: 'mcq', question: 'Choose: "We need to leave now; ___, we\'ll miss the train."', options: ['otherwise', 'moreover', 'for example'], correct_answer: 'otherwise', explanation: '"Otherwise" means "if not" and shows a result.' },
    ],
  },
};

function buildFile(level, topic, items) {
  const prefix = { beginner: 'beg', intermediate: 'int', advanced: 'adv' }[level];
  return items.map((item, index) => ({
    id: `${prefix}_${topic}_${String(index + 1).padStart(2, '0')}`,
    level,
    topic,
    type: item.type,
    question: item.question,
    options: item.options,
    correct_answer: item.correct_answer,
    explanation: item.explanation,
  }));
}

function writeAll() {
  let total = 0;
  for (const [level, topics] of Object.entries(EXERCISES)) {
    for (const [topic, items] of Object.entries(topics)) {
      const dir = path.join(CONTENT_ROOT, level);
      fs.mkdirSync(dir, { recursive: true });
      const filePath = path.join(dir, `${topic}.json`);
      const exercises = buildFile(level, topic, items);
      fs.writeFileSync(filePath, JSON.stringify(exercises, null, 2) + '\n', 'utf-8');
      total += exercises.length;
      console.log(`Wrote ${exercises.length} → ${filePath}`);
    }
  }
  console.log(`\nTotal: ${total} exercises across ${Object.keys(EXERCISES).length} levels`);
}

writeAll();
