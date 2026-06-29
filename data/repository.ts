/**
 * IRepository — the single contract every data backend must implement.
 *
 * Mathris data layer is fully behind this interface, meaning you can swap
 * the backing store (SQLite → Supabase, MMKV, in-memory) by providing a new
 * implementation and calling `setRepository(impl)` before the app starts.
 */

export interface MasteryEntry {
  attempts: number;
  correct: number;
}

export interface WrongAnswerEntry {
  id?: number;
  equation: string;
  userAnswer: string;
  correctAnswer: string;
  topic: string;
  difficulty: string;
  timestamp: number; // unix ms
}

export interface SessionRecord {
  id?: number;
  score: number;
  accuracy: number; // 0.0 – 1.0
  playedAt: number; // unix ms
}

