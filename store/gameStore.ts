import { create } from 'zustand';
import type { Grid, Cell } from '../engine/engine';
import { createEmptyGrid } from '../engine/engine';
import type { FallingBrick } from '../engine/bricks';
import type { Equation, EquationTopic } from '../engine/equations';
import type { Difficulty } from '../constants/config';
import {
  FREEZE_TOKENS_PER_GAME,
  HINT_TOKENS_PER_GAME,
  TICK_INTERVAL_MS,
} from '../constants/config';

export type GamePhase = 'idle' | 'playing' | 'paused' | 'answering' | 'gameover';

export interface GameState {
  phase: GamePhase;
  difficulty: Difficulty;
  grid: Grid;
  currentBrick: FallingBrick | null;
  nextBrick: FallingBrick | null;
  score: number;
  level: number;
  linesCleared: number;
  combo: number;          // consecutive correct answers
  isHotStreak: boolean;
  correctCount: number;    // total correct answers this session
  freezeTokens: number;
  hintTokens: number;
  wrongAnswerFlash: boolean;   // trigger red flash on brick
  lastClearedRows: number[];
  lastEquation: Equation | null;
  practiceTopic: EquationTopic | null;

  // Actions
  setPhase: (p: GamePhase) => void;
  setDifficulty: (d: Difficulty) => void;
  setGrid: (g: Grid) => void;
  setCurrentBrick: (b: FallingBrick | null) => void;
  setNextBrick: (b: FallingBrick | null) => void;
  addScore: (n: number) => void;
  incrementLines: (n: number) => void;
  incrementCombo: () => void;
  resetCombo: () => void;
  incrementCorrectCount: () => void;
  useFreeze: () => void;
  useHint: () => void;
  setWrongAnswerFlash: (v: boolean) => void;
  setClearedRows: (rows: number[]) => void;
  setLastEquation: (eq: Equation | null) => void;
  setPracticeTopic: (t: EquationTopic | null) => void;
  resetGame: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  phase: 'idle',
  difficulty: 'easy',
  grid: createEmptyGrid(),
  currentBrick: null,
  nextBrick: null,
  score: 0,
  level: 1,
  linesCleared: 0,
  combo: 0,
  isHotStreak: false,
  correctCount: 0,
  freezeTokens: FREEZE_TOKENS_PER_GAME,
  hintTokens: HINT_TOKENS_PER_GAME,
  wrongAnswerFlash: false,
  lastClearedRows: [],
  lastEquation: null,
  practiceTopic: null,

  setPhase: (phase) => set({ phase }),
  setDifficulty: (difficulty) => set({ difficulty }),
  setGrid: (grid) => set({ grid }),
  setCurrentBrick: (currentBrick) => set({ currentBrick }),
  setNextBrick: (nextBrick) => set({ nextBrick }),
  addScore: (n) => set(s => ({ score: s.score + n })),
  incrementLines: (n) => set(s => {
    const linesCleared = s.linesCleared + n;
    const level = Math.floor(linesCleared / 10) + 1;
    return { linesCleared, level };
  }),
  incrementCombo: () => set(s => {
    const combo = s.combo + 1;
    return { combo, isHotStreak: combo >= 3 };
  }),
  resetCombo: () => set({ combo: 0, isHotStreak: false }),
  incrementCorrectCount: () => set(s => ({ correctCount: s.correctCount + 1 })),
  useFreeze: () => set(s => ({ freezeTokens: Math.max(0, s.freezeTokens - 1) })),
  useHint: () => set(s => ({ hintTokens: Math.max(0, s.hintTokens - 1) })),
  setWrongAnswerFlash: (wrongAnswerFlash) => set({ wrongAnswerFlash }),
  setClearedRows: (lastClearedRows) => set({ lastClearedRows }),
  setLastEquation: (lastEquation) => set({ lastEquation }),
  setPracticeTopic: (practiceTopic) => set({ practiceTopic }),
  resetGame: () => set({
    phase: 'idle',
    grid: createEmptyGrid(),
    currentBrick: null,
    nextBrick: null,
    score: 0,
    level: 1,
    linesCleared: 0,
    combo: 0,
    isHotStreak: false,
    correctCount: 0,
    freezeTokens: FREEZE_TOKENS_PER_GAME,
    hintTokens: HINT_TOKENS_PER_GAME,
    wrongAnswerFlash: false,
    lastClearedRows: [],
    lastEquation: null,
    practiceTopic: null,
  }),
}));
