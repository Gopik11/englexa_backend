export type MiniLessonModule =
  | 'grammar'
  | 'vocabulary'
  | 'writing'
  | 'speaking';

export interface QuickPracticeItem {
  question: string;
  options: string[];
  answer: string;
}

export interface MiniLesson {
  id: string;
  concept: string;
  module: MiniLessonModule;
  difficulty_level: number;
  title: string;
  explanation: string;
  examples: string[];
  common_mistakes: string[];
  quick_practice: QuickPracticeItem[];
  estimated_time: number;
  completed?: boolean;
}

export interface GenerateLessonDto {
  concept: string;
  difficulty_level?: number;
  module?: MiniLessonModule;
}

export interface CompleteLessonDto {
  lesson_id: string;
  concept: string;
  module: MiniLessonModule;
}
