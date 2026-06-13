export type ErrorPatternModule =
  | 'grammar'
  | 'vocabulary'
  | 'reading'
  | 'speaking'
  | 'writing';

export interface ErrorPatternRecord {
  userId: string;
  module: ErrorPatternModule;
  concept: string;
  error_type: string;
  count: number;
  last_seen: Date;
  examples: string[];
}

export interface DetectedErrorPattern {
  module: ErrorPatternModule;
  concept: string;
  error_type: string;
}

export interface DetectErrorInput {
  userAnswer: string;
  correctAnswer: string;
  module: ErrorPatternModule;
  concept?: string;
  topic?: string;
}

export interface ErrorProfile {
  userId: string;
  total_patterns: number;
  total_errors: number;
  by_module: Record<
    ErrorPatternModule,
    {
      patterns: ErrorPatternRecord[];
      total_count: number;
    }
  >;
  top_patterns: ErrorPatternRecord[];
}

export interface RecordErrorPatternInput {
  module: ErrorPatternModule;
  concept: string;
  error_type: string;
}
