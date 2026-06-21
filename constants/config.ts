// Mathris Game Configuration

export const GRID_COLS = 10;
export const GRID_ROWS = 20;

export const TICK_INTERVAL_MS = {
  easy: 800,
  medium: 650,
  hard: 950, // Hard bricks fall slower — more time to solve
} as const;

export const LOCK_DELAY_MS = 500;
export const WRONG_ANSWER_SPEED_PENALTY = 0.12; // +12% faster per wrong answer
export const MAX_RETRIES = 1;

export const FREEZE_DURATION_MS = 10_000; // 10 seconds
export const FREEZE_TOKENS_PER_GAME = 3;
export const HINT_TOKENS_PER_GAME = 3;
export const HINT_SCORE_COST = 50;

export const COMBO_THRESHOLD = 3; // consecutive correct to trigger Hot Streak
export const COMBO_MULTIPLIER = 2;

export const SCORE = {
  lockCorrect: 10,
  rowClear: 100,
  rowClearMulti: (rows: number) => [0, 100, 250, 400, 600][rows] ?? 600,
  perfectClear: 1000,
  speedBonus: (msLeft: number) => Math.floor(msLeft / 100),
} as const;

export const XP_PER_CORRECT = 5;
export const XP_PER_ROW_CLEAR = 20;
export const XP_PER_LEVEL = 200;

export const STARS = {
  three: 0.9,  // ≥90% accuracy
  two: 0.65,   // ≥65% accuracy
  one: 0,      // any
} as const;

export type Difficulty = 'easy' | 'medium' | 'hard';

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
};
