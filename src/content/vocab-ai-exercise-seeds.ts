import { LearnerLevel } from './englexa-content-spec.constants';
import {
  VocabExerciseBlueprint,
  VocabTopic,
} from '../vocabulary-practice/interfaces/vocab-exercise.interface';

type LevelSeeds = Record<LearnerLevel, VocabExerciseBlueprint[]>;

function topic(seeds: LevelSeeds): Record<LearnerLevel, VocabExerciseBlueprint[]> {
  return seeds;
}

function b(partial: VocabExerciseBlueprint): VocabExerciseBlueprint {
  return partial;
}

export const DEFAULT_VOCAB_AI_TOPIC: VocabTopic = 'common_nouns';

export const VOCAB_EXERCISE_BLUEPRINTS: Partial<
  Record<VocabTopic, Record<LearnerLevel, VocabExerciseBlueprint[]>>
> = {
  common_nouns: topic({
    beginner: [
      b({ type: 'fill_in', question: 'I put my keys on the ___ near the door.', options: null, correct_answer: 'table', explanation: 'A table is a flat surface for placing items. It is a common household noun.', example_sentence: 'My keys are on the table.', collocations: ['dining table', 'on the table'] }),
      b({ type: 'mcq', question: 'Which word means a place where you buy medicine?', options: ['pharmacy', 'library', 'bakery', 'garage'], correct_answer: 'pharmacy', explanation: 'A pharmacy sells medicine and health products. Use this word when talking about illness.', example_sentence: 'She went to the pharmacy for cough syrup.', collocations: ['local pharmacy', 'visit the pharmacy'] }),
    ],
    intermediate: [
      b({ type: 'match', question: 'Match "receipt" to its meaning.', options: ['Proof of payment', 'A type of shoe', 'A school subject'], correct_answer: 'Proof of payment', explanation: 'A receipt shows what you paid for in a shop. Keep it when you may need a refund.', example_sentence: 'Save the receipt in case the shirt does not fit.', collocations: ['keep the receipt', 'print a receipt'] }),
    ],
    advanced: [
      b({ type: 'fill_in', question: 'The lawyer reviewed every ___ in the contract.', options: null, correct_answer: 'clause', explanation: 'A clause is a section in a legal document. It is common in formal reading.', example_sentence: 'Read each clause before you sign.', collocations: ['contract clause', 'key clause'] }),
    ],
  }),
  common_verbs: topic({
    beginner: [
      b({ type: 'mcq', question: 'Which verb means to move through water?', options: ['swim', 'fly', 'drive', 'paint'], correct_answer: 'swim', explanation: 'Swim describes moving in water. It is a high-frequency verb for hobbies and sports.', example_sentence: 'We swim at the beach in summer.', collocations: ['swim in the sea', 'learn to swim'] }),
    ],
    intermediate: [
      b({ type: 'fill_in', question: 'Please ___ the form and return it today.', options: null, correct_answer: 'complete', explanation: 'Complete means to finish filling in all required parts. It is common in offices and schools.', example_sentence: 'Complete the form in black ink.', collocations: ['complete a form', 'complete the task'] }),
    ],
    advanced: [
      b({ type: 'mcq', question: 'Which verb means to make something less severe?', options: ['alleviate', 'ignore', 'delete', 'borrow'], correct_answer: 'alleviate', explanation: 'Alleviate means to reduce pain or difficulty. It appears in health and policy writing.', example_sentence: 'The medicine alleviated her symptoms.', collocations: ['alleviate pain', 'alleviate pressure'] }),
    ],
  }),
  phrasal_verbs: topic({
    beginner: [
      b({ type: 'mcq', question: 'What does "pick up" mean here? "Can you pick up milk on your way home?"', options: ['buy or collect', 'throw away', 'cook slowly', 'forget'], correct_answer: 'buy or collect', explanation: 'Pick up can mean collect something while you are out. Context shows shopping, not lifting.', example_sentence: 'I will pick up the package after work.', collocations: ['pick up groceries', 'pick up a friend'] }),
    ],
    intermediate: [
      b({ type: 'fill_in', question: 'We had to ___ the meeting because the manager was ill.', options: null, correct_answer: 'call off', explanation: 'Call off means to cancel a planned event. It is natural in workplace English.', example_sentence: 'They called off the interview.', collocations: ['call off a meeting', 'call off plans'] }),
    ],
    advanced: [
      b({ type: 'match', question: 'Match "zero in on" to its meaning.', options: ['Focus closely on something', 'Start from zero', 'Cancel a project'], correct_answer: 'Focus closely on something', explanation: 'Zero in on means to concentrate on a target or problem. It is common in analysis.', example_sentence: 'The team zeroed in on the main issue.', collocations: ['zero in on a problem', 'zero in on details'] }),
    ],
  }),
  collocations: topic({
    beginner: [
      b({ type: 'mcq', question: 'Which phrase is correct?', options: ['make a mistake', 'do a mistake', 'have a mistake', 'take a mistake'], correct_answer: 'make a mistake', explanation: 'Make a mistake is the natural collocation. Native speakers rarely say do a mistake.', example_sentence: 'Everyone makes mistakes when learning.', collocations: ['make a mistake', 'learn from mistakes'] }),
    ],
    intermediate: [
      b({ type: 'fill_in', question: 'She has a keen ___ in modern art.', options: null, correct_answer: 'interest', explanation: 'Have an interest in is a fixed phrase for enthusiasm about a topic.', example_sentence: 'He has a strong interest in science.', collocations: ['keen interest', 'interest in art'] }),
    ],
    advanced: [
      b({ type: 'mcq', question: 'Which collocation fits formal writing?', options: ['pose a threat', 'make a threat big', 'do a threat', 'have threat'], correct_answer: 'pose a threat', explanation: 'Pose a threat is formal and common in news and reports.', example_sentence: 'The storm poses a threat to coastal towns.', collocations: ['pose a threat', 'serious threat'] }),
    ],
  }),
  idioms: topic({
    beginner: [
      b({ type: 'match', question: 'Match "piece of cake" to its meaning.', options: ['Very easy', 'A dessert recipe', 'A broken plate'], correct_answer: 'Very easy', explanation: 'Piece of cake means something is very easy. The meaning is figurative, not literal.', example_sentence: 'The quiz was a piece of cake.', collocations: ['easy as pie', 'no problem at all'] }),
    ],
    intermediate: [
      b({ type: 'mcq', question: 'If you are "on the fence," you are ___', options: ['undecided', 'angry', 'tired', 'lost'], correct_answer: 'undecided', explanation: 'On the fence means you have not chosen a side yet. Use it for opinions and decisions.', example_sentence: 'I am still on the fence about the offer.', collocations: ['sit on the fence', 'remain on the fence'] }),
    ],
    advanced: [
      b({ type: 'fill_in', question: 'After the error, he decided to ___ the bullet and apologise.', options: null, correct_answer: 'bite', explanation: 'Bite the bullet means to face something unpleasant bravely. It is informal but widely used.', example_sentence: 'She bit the bullet and told the truth.', collocations: ['bite the bullet', 'face the consequences'] }),
    ],
  }),
  academic_words: topic({
    beginner: [
      b({ type: 'mcq', question: 'Which word means information that supports an idea?', options: ['evidence', 'fiction', 'noise', 'gesture'], correct_answer: 'evidence', explanation: 'Evidence is proof used in essays and research. Strong evidence makes arguments convincing.', example_sentence: 'The study provides clear evidence.', collocations: ['strong evidence', 'supporting evidence'] }),
    ],
    intermediate: [
      b({ type: 'fill_in', question: 'The author ___ that education reduces inequality.', options: null, correct_answer: 'argues', explanation: 'Argue in academic writing means to present a reasoned claim, not to shout.', example_sentence: 'She argues that access matters.', collocations: ['argue that', 'clearly argues'] }),
    ],
    advanced: [
      b({ type: 'match', question: 'Match "paradigm" to its meaning.', options: ['A typical model or pattern', 'A small mistake', 'A final grade'], correct_answer: 'A typical model or pattern', explanation: 'Paradigm refers to a framework people use to understand a field.', example_sentence: 'The discovery shifted the research paradigm.', collocations: ['new paradigm', 'dominant paradigm'] }),
    ],
  }),
  topic_business: topic({
    beginner: [
      b({ type: 'mcq', question: 'What is a "profit"?', options: ['Money earned after costs', 'A type of meeting', 'A office supply'], correct_answer: 'Money earned after costs', explanation: 'Profit is revenue minus expenses. Businesses track it to measure success.', example_sentence: 'Profit rose after costs fell.', collocations: ['net profit', 'profit margin'] }),
    ],
    intermediate: [
      b({ type: 'fill_in', question: 'The team will ___ a proposal to the client on Friday.', options: null, correct_answer: 'pitch', explanation: 'Pitch means to present an idea persuasively in business settings.', example_sentence: 'She pitched the design confidently.', collocations: ['pitch a proposal', 'sales pitch'] }),
    ],
    advanced: [
      b({ type: 'mcq', question: 'What is "due diligence"?', options: ['Careful investigation before a deal', 'A daily stand-up meeting', 'A holiday bonus'], correct_answer: 'Careful investigation before a deal', explanation: 'Due diligence reviews risks before investments or mergers.', example_sentence: 'Legal due diligence took three weeks.', collocations: ['conduct due diligence', 'financial due diligence'] }),
    ],
  }),
  topic_technology: topic({
    beginner: [
      b({ type: 'mcq', question: 'What is a "password"?', options: ['A secret code to access an account', 'A computer screen', 'A type of cable'], correct_answer: 'A secret code to access an account', explanation: 'A password protects your accounts. Use a strong, unique password for safety.', example_sentence: 'Choose a strong password.', collocations: ['strong password', 'reset your password'] }),
    ],
    intermediate: [
      b({ type: 'fill_in', question: 'The team will ___ the software bug tonight.', options: null, correct_answer: 'patch', explanation: 'Patch means to fix software with an update. IT teams release patches for security.', example_sentence: 'Install the patch immediately.', collocations: ['security patch', 'patch the system'] }),
    ],
    advanced: [
      b({ type: 'match', question: 'Match "latency" to its meaning.', options: ['Delay in a network response', 'Total storage space', 'Battery percentage'], correct_answer: 'Delay in a network response', explanation: 'Low latency means fast response times, which matters for calls and gaming.', example_sentence: 'Latency dropped after the upgrade.', collocations: ['low latency', 'network latency'] }),
    ],
  }),
};
