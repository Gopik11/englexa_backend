export interface MultipleChoiceOptions {
  choices: Array<{ id: string; text: string }>;
}

export interface MultipleChoiceAnswer {
  correctOptionId: string;
}

export interface FillInBlankOptions {
  template: string;
  blanks: number;
}

export interface FillInBlankAnswer {
  answers: string[];
}

export interface ReorderSentenceOptions {
  words: string[];
}

export interface ReorderSentenceAnswer {
  order: string[];
}

export interface PictureWordMatchOptions {
  images: Array<{ id: string; url: string; label?: string }>;
  words: string[];
}

export interface PictureWordMatchAnswer {
  pairs: Array<{ imageId: string; word: string }>;
}

export interface ExerciseEvaluationResult {
  exerciseId: string;
  isCorrect: boolean;
  score: number;
  feedback: string;
}
