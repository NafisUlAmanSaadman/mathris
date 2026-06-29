import { create } from 'zustand';
import { db } from '../data/sqliteRepository';
import type { MasteryEntry, WrongAnswerEntry, SessionRecord } from '../data/repository';

import { XP_PER_LEVEL } from '../constants/config';
import { FontFamily } from '../constants/theme';

// ─── State shape ─────────────────────────────────────────────────────────────

export interface ProgressState {
  // Cached in-memory view of DB state (for instant UI reads)
  xp: number;
  level: number;
  totalGames: number;
  masteryByTopic: Record<string, MasteryEntry>;
  wrongAnswerLog: WrongAnswerEntry[];
  sessionHistory: SessionRecord[];

  // Settings / Accessibility
  dyslexiaFontEnabled: boolean;
  adaptiveModeEnabled: boolean;
  hapticsEnabled: boolean;

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

  /** Toggle dyslexia-friendly font setting */
  toggleDyslexiaFont: () => Promise<void>;

  /** Toggle adaptive practice mode */
  toggleAdaptiveMode: () => Promise<void>;

  /** Toggle haptic feedback setting */
  toggleHaptics: () => Promise<void>;

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
  dyslexiaFontEnabled: false,
  adaptiveModeEnabled: false,
  hapticsEnabled: true,
  loaded: false,

  // ── load ──────────────────────────────────────────────────────────────────

  load: async () => {
    const repo = db;
    const [xp, totalGames, masteryByTopic, wrongAnswerLog, sessionHistory, dyslexiaRaw, adaptiveRaw, hapticsRaw] =
      await Promise.all([
        repo.getXP(),
        repo.getTotalGames(),
        repo.getMasteryByTopic(),
        repo.getWrongAnswers(200),
        repo.getSessions(30),
        repo.getPreference('dyslexia_font', 'false'),
        repo.getPreference('adaptive_mode', 'false'),
        repo.getPreference('haptics_enabled', 'true'),
      ]);

    set({
      xp,
      level: xpToLevel(xp),
      totalGames,
      masteryByTopic,
      wrongAnswerLog,
      sessionHistory,
      dyslexiaFontEnabled: dyslexiaRaw === 'true',
      adaptiveModeEnabled: adaptiveRaw === 'true',
      hapticsEnabled: hapticsRaw === 'true',
      loaded: true,
    });
  },

  // ── recordCorrect ─────────────────────────────────────────────────────────

  recordCorrect: async (topic) => {
    const repo = db;
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
    const repo = db;
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
    const repo = db;
    await repo.recordSession(score, accuracy);

    const [totalGames, sessionHistory] = await Promise.all([
      repo.getTotalGames(),
      repo.getSessions(30),
    ]);

    set({ totalGames, sessionHistory });
  },

  // ── addXP ─────────────────────────────────────────────────────────────────

  addXP: async (amount) => {
    const repo = db;
    await repo.addXP(amount);

    set(s => {
      const xp = s.xp + amount;
      return { xp, level: xpToLevel(xp) };
    });
  },

  // ── toggleDyslexiaFont ────────────────────────────────────────────────────

  toggleDyslexiaFont: async () => {
    const nextVal = !get().dyslexiaFontEnabled;
    await db.setPreference('dyslexia_font', String(nextVal));
    set({ dyslexiaFontEnabled: nextVal });
  },

  // ── toggleAdaptiveMode ────────────────────────────────────────────────────

  toggleAdaptiveMode: async () => {
    const nextVal = !get().adaptiveModeEnabled;
    await db.setPreference('adaptive_mode', String(nextVal));
    set({ adaptiveModeEnabled: nextVal });
  },

  // ── toggleHaptics ─────────────────────────────────────────────────────────

  toggleHaptics: async () => {
    const nextVal = !get().hapticsEnabled;
    await db.setPreference('haptics_enabled', String(nextVal));
    set({ hapticsEnabled: nextVal });
  },

  // ── clearWrongLog ─────────────────────────────────────────────────────────

  clearWrongLog: async () => {
    await db.clearWrongAnswers();
    set({ wrongAnswerLog: [] });
  },

  // ── clearAll ──────────────────────────────────────────────────────────────

  clearAll: async () => {
    await db.clearAll();
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

// ─── useFontFamily Hook ────────────────────────────────────────────────────────

export function useFontFamily(type: keyof typeof FontFamily): string {
  const dyslexiaFontEnabled = useProgressStore(s => s.dyslexiaFontEnabled);
  if (dyslexiaFontEnabled) {
    if (type === 'heading' || type === 'monoBold') {
      return 'OpenDyslexic-Bold';
    }
    return 'OpenDyslexic-Regular';
  }
  return FontFamily[type];
}
