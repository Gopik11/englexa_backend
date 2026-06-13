export interface StreakStatus {
  streak: number;
  lastActiveAt: Date | null;
}

export interface StreakUpdateResult {
  streak: number;
  incremented: boolean;
}
