import { create } from 'zustand';
import { getRepository } from '../data/repositoryProvider';
import type { MasteryEntry, WrongAnswerEntry, SessionRecord } from '../data/repository';
import { XP_PER_LEVEL } from '../constants/config';

// ─── State shape ─────────────────────────────────────────────────────────────

export interface ProgressState {
  // Cached in-memory view of DB state (for instant UI reads)
  xp: number;
  level: number;
  totalGames: number;
  masteryByTopic: Record<string, MasteryEntry>;
  wrongAnswerLog: WrongAnswerEntry[];
  sessionHistory: SessionRecord[];

  /** True once the initial DB load has completed */
  loaded: boolean;

  // ── Actions ────────────────────────────────────────────────────────────────

  /** Hydrate in-memory state from the database. Call once on app start. */
  load: () => Promise<void>;

  /** Record a correct answer for a topic */
  recordCorrect: (topic: string) => Promise<void>;

  /** Record a wrong answer */
  recordWrong: (entry: Omit<WrongAnswerEntry, 'id'>) => Promise<void>;

  /** Persist a completed game session and refresh session history */
  recordSession: (score: number, accuracy: number) => Promise<void>;

  /** Add XP and recompute level */
  addXP: (amount: number) => Promise<void>;

  /** Clear the wrong-answer log */
  clearWrongLog: () => Promise<void>;

  /** Hard reset — wipes all DB data and resets in-memory state */
  clearAll: () => Promise<void>;
}

// ─── Level formula ────────────────────────────────────────────────────────────

function xpToLevel(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useProgressStore = create<ProgressState>((set, get) => ({
  xp: 0,
  level: 1,
  totalGames: 0,
  masteryByTopic: {},
  wrongAnswerLog: [],
  sessionHistory: [],
  loaded: false,

  // ── load ──────────────────────────────────────────────────────────────────

  load: async () => {
    const repo = getRepository();
    const [xp, totalGames, masteryByTopic, wrongAnswerLog, sessionHistory] =
      await Promise.all([
        repo.getXP(),
        repo.getTotalGames(),
        repo.getMasteryByTopic(),
        repo.getWrongAnswers(200),
        repo.getSessions(30),
      ]);

    set({
      xp,
      level: xpToLevel(xp),
      totalGames,
      masteryByTopic,
      wrongAnswerLog,
      sessionHistory,
      loaded: true,
    });
  },

  // ── recordCorrect ─────────────────────────────────────────────────────────

  recordCorrect: async (topic) => {
    const repo = getRepository();
    await repo.updateMastery(topic, true);

    // Optimistic in-memory update
    set(s => {
      const existing = s.masteryByTopic[topic] ?? { attempts: 0, correct: 0 };
      return {
        masteryByTopic: {
          ...s.masteryByTopic,
          [topic]: {
            attempts: existing.attempts + 1,
            correct: existing.correct + 1,
          },
        },
      };
    });
  },

  // ── recordWrong ───────────────────────────────────────────────────────────

  recordWrong: async (entry) => {
    const repo = getRepository();
    await Promise.all([
      repo.recordWrongAnswer(entry),
      repo.updateMastery(entry.topic, false),
    ]);

    set(s => {
      const existing = s.masteryByTopic[entry.topic] ?? { attempts: 0, correct: 0 };
      return {
        masteryByTopic: {
          ...s.masteryByTopic,
          [entry.topic]: { ...existing, attempts: existing.attempts + 1 },
        },
        wrongAnswerLog: [
          { ...entry, id: Date.now() }, // optimistic id
          ...s.wrongAnswerLog,
        ].slice(0, 200),
      };
    });
  },

  // ── recordSession ─────────────────────────────────────────────────────────

  recordSession: async (score, accuracy) => {
    const repo = getRepository();
    await repo.recordSession(score, accuracy);

    const [totalGames, sessionHistory] = await Promise.all([
      repo.getTotalGames(),
      repo.getSessions(30),
    ]);

    set({ totalGames, sessionHistory });
  },

  // ── addXP ─────────────────────────────────────────────────────────────────

  addXP: async (amount) => {
    const repo = getRepository();
    await repo.addXP(amount);

    set(s => {
      const xp = s.xp + amount;
      return { xp, level: xpToLevel(xp) };
    });
  },

  // ── clearWrongLog ─────────────────────────────────────────────────────────

  clearWrongLog: async () => {
    await getRepository().clearWrongAnswers();
    set({ wrongAnswerLog: [] });
  },

  // ── clearAll ──────────────────────────────────────────────────────────────

  clearAll: async () => {
    await getRepository().clearAll();
    set({
      xp: 0,
      level: 1,
      totalGames: 0,
      masteryByTopic: {},
      wrongAnswerLog: [],
      sessionHistory: [],
    });
  },
}));
