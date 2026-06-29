import * as SQLite from 'expo-sqlite';
import type { MasteryEntry, WrongAnswerEntry, SessionRecord } from './repository';
import { XP_PER_LEVEL } from '../constants/config';

// ─── Schema & Migrations ─────────────────────────────────────────────────────

const MIGRATIONS: string[] = [
  // v1 — initial schema
  `
  CREATE TABLE IF NOT EXISTS meta (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS player (
    id      INTEGER PRIMARY KEY CHECK (id = 1),
    xp      INTEGER NOT NULL DEFAULT 0,
    games   INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    score     INTEGER NOT NULL,
    accuracy  REAL    NOT NULL,
    played_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS mastery (
    topic    TEXT    PRIMARY KEY,
    attempts INTEGER NOT NULL DEFAULT 0,
    correct  INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS wrong_answers (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    equation       TEXT NOT NULL,
    user_answer    TEXT NOT NULL,
    correct_answer TEXT NOT NULL,
    topic          TEXT NOT NULL,
    difficulty     TEXT NOT NULL,
    answered_at    INTEGER NOT NULL
  );

  INSERT OR IGNORE INTO meta (key, value) VALUES ('schema_version', '1');
  INSERT OR IGNORE INTO player (id, xp, games) VALUES (1, 0, 0);
  `,
];

// ─── SQLiteRepository ─────────────────────────────────────────────────────────

export class SQLiteRepository {

  private db!: SQLite.SQLiteDatabase;
  private readonly dbName: string;

  constructor(dbName = 'mathris.db') {
    this.dbName = dbName;
  }

  // ── Lifecycle ───────────────────────────────────────────────────────────────

  async initialize(): Promise<void> {
    this.db = await SQLite.openDatabaseAsync(this.dbName);

    // WAL mode for better concurrent read performance
    await this.db.execAsync('PRAGMA journal_mode = WAL;');

    // Run each migration inside its own transaction
    const currentVersion = await this.getSchemaVersion();

    for (let i = currentVersion; i < MIGRATIONS.length; i++) {
      await this.db.withTransactionAsync(async () => {
        await this.db.execAsync(MIGRATIONS[i]);
        await this.db.runAsync(
          `UPDATE meta SET value = ? WHERE key = 'schema_version'`,
          [String(i + 1)],
        );
      });
    }
  }

  private async getSchemaVersion(): Promise<number> {
    try {
      const row = await this.db.getFirstAsync<{ value: string }>(
        `SELECT value FROM meta WHERE key = 'schema_version'`,
      );
      return row ? parseInt(row.value, 10) : 0;
    } catch {
      return 0;
    }
  }

  // ── XP & Level ──────────────────────────────────────────────────────────────

  async getXP(): Promise<number> {
    const row = await this.db.getFirstAsync<{ xp: number }>(
      `SELECT xp FROM player WHERE id = 1`,
    );
    return row?.xp ?? 0;
  }

  async addXP(amount: number): Promise<void> {
    await this.db.runAsync(
      `UPDATE player SET xp = xp + ? WHERE id = 1`,
      [amount],
    );
  }

  // ── Sessions ────────────────────────────────────────────────────────────────

  async recordSession(score: number, accuracy: number): Promise<void> {
    await this.db.withTransactionAsync(async () => {
      await this.db.runAsync(
        `INSERT INTO sessions (score, accuracy, played_at) VALUES (?, ?, ?)`,
        [score, accuracy, Date.now()],
      );
      await this.db.runAsync(
        `UPDATE player SET games = games + 1 WHERE id = 1`,
      );
    });
  }

  async getSessions(limit = 30): Promise<SessionRecord[]> {
    const rows = await this.db.getAllAsync<{
      id: number;
      score: number;
      accuracy: number;
      played_at: number;
    }>(
      `SELECT id, score, accuracy, played_at FROM sessions ORDER BY played_at DESC LIMIT ?`,
      [limit],
    );
    return rows.map(r => ({
      id: r.id,
      score: r.score,
      accuracy: r.accuracy,
      playedAt: r.played_at,
    }));
  }

  async getTotalGames(): Promise<number> {
    const row = await this.db.getFirstAsync<{ games: number }>(
      `SELECT games FROM player WHERE id = 1`,
    );
    return row?.games ?? 0;
  }

  // ── Topic Mastery ────────────────────────────────────────────────────────────

  async updateMastery(topic: string, correct: boolean): Promise<void> {
    await this.db.runAsync(
      `INSERT INTO mastery (topic, attempts, correct)
         VALUES (?, 1, ?)
       ON CONFLICT(topic) DO UPDATE SET
         attempts = attempts + 1,
         correct  = correct + ?`,
      [topic, correct ? 1 : 0, correct ? 1 : 0],
    );
  }

  async getMasteryByTopic(): Promise<Record<string, MasteryEntry>> {
    const rows = await this.db.getAllAsync<{
      topic: string;
      attempts: number;
      correct: number;
    }>(`SELECT topic, attempts, correct FROM mastery`);

    return Object.fromEntries(
      rows.map(r => [r.topic, { attempts: r.attempts, correct: r.correct }]),
    );
  }

  // ── Wrong-Answer Log ─────────────────────────────────────────────────────────

  async recordWrongAnswer(entry: Omit<WrongAnswerEntry, 'id'>): Promise<void> {
    await this.db.runAsync(
      `INSERT INTO wrong_answers
         (equation, user_answer, correct_answer, topic, difficulty, answered_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        entry.equation,
        entry.userAnswer,
        entry.correctAnswer,
        entry.topic,
        entry.difficulty,
        entry.timestamp,
      ],
    );
  }

  async getWrongAnswers(limit = 200): Promise<WrongAnswerEntry[]> {
    const rows = await this.db.getAllAsync<{
      id: number;
      equation: string;
      user_answer: string;
      correct_answer: string;
      topic: string;
      difficulty: string;
      answered_at: number;
    }>(
      `SELECT id, equation, user_answer, correct_answer, topic, difficulty, answered_at
         FROM wrong_answers
        ORDER BY answered_at DESC
        LIMIT ?`,
      [limit],
    );
    return rows.map(r => ({
      id: r.id,
      equation: r.equation,
      userAnswer: r.user_answer,
      correctAnswer: r.correct_answer,
      topic: r.topic,
      difficulty: r.difficulty,
      timestamp: r.answered_at,
    }));
  }

  async clearWrongAnswers(): Promise<void> {
    await this.db.runAsync(`DELETE FROM wrong_answers`);
  }

  // ── Preferences ──────────────────────────────────────────────────────────────

  async getPreference(key: string, defaultValue: string): Promise<string> {
    try {
      const row = await this.db.getFirstAsync<{ value: string }>(
        `SELECT value FROM meta WHERE key = ?`,
        [key],
      );
      return row ? row.value : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  async setPreference(key: string, value: string): Promise<void> {
    await this.db.runAsync(
      `INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)`,
      [key, value],
    );
  }

  // ── Housekeeping ─────────────────────────────────────────────────────────────

  async clearAll(): Promise<void> {
    await this.db.withTransactionAsync(async () => {
      await this.db.execAsync(`
        DELETE FROM sessions;
        DELETE FROM mastery;
        DELETE FROM wrong_answers;
        UPDATE player SET xp = 0, games = 0 WHERE id = 1;
      `);
    });
  }
}

export const db = new SQLiteRepository();

