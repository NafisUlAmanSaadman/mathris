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

export interface PlayerStats {
  xp: number;
  level: number;
  totalGames: number;
}

// ─── Interface ────────────────────────────────────────────────────────────────

export interface IRepository {
  /**
   * Called once on app start. Run migrations, create tables, seed defaults.
   * Must resolve before any other method is called.
   */
  initialize(): Promise<void>;

  // ── XP & Level ──────────────────────────────────────────────────────────────

  /** Return current XP total */
  getXP(): Promise<number>;

  /** Atomically add `amount` XP */
  addXP(amount: number): Promise<void>;

  // ── Sessions ────────────────────────────────────────────────────────────────

  /** Persist a completed game session */
  recordSession(score: number, accuracy: number): Promise<void>;

  /** Return the last `limit` sessions, newest first */
  getSessions(limit?: number): Promise<SessionRecord[]>;

  /** Total number of games ever played */
  getTotalGames(): Promise<number>;

  // ── Topic Mastery ────────────────────────────────────────────────────────────

  /**
   * Record one equation attempt.
   * @param correct  whether the player answered correctly
   */
  updateMastery(topic: string, correct: boolean): Promise<void>;

  /** Return accuracy map for every topic that has been attempted */
  getMasteryByTopic(): Promise<Record<string, MasteryEntry>>;

  // ── Wrong-Answer Log ─────────────────────────────────────────────────────────

  /** Append a wrong answer entry */
  recordWrongAnswer(entry: Omit<WrongAnswerEntry, 'id'>): Promise<void>;

  /** Return the last `limit` wrong answers, newest first */
  getWrongAnswers(limit?: number): Promise<WrongAnswerEntry[]>;

  /** Delete all wrong-answer records */
  clearWrongAnswers(): Promise<void>;

  // ── Preferences / Settings ───────────────────────────────────────────────────

  /** Get a preference value, fallback to defaultValue if not set */
  getPreference(key: string, defaultValue: string): Promise<string>;

  /** Set a preference value */
  setPreference(key: string, value: string): Promise<void>;

  // ── Housekeeping ─────────────────────────────────────────────────────────────

  /** Wipe ALL data (used for dev/reset) */
  clearAll(): Promise<void>;
}
