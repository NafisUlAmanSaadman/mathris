import { Colors } from '../constants/theme';
import type { Equation } from './equations';
import type { Difficulty } from '../constants/config';

// ─── Types ───────────────────────────────────────────────────────────────────

export type TetrominoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

export interface Tetromino {
  type: TetrominoType;
  color: string;
  /** 2D matrix — 1 = filled cell */
  matrix: number[][];
}

export interface FallingBrick {
  tetromino: Tetromino;
  equation: Equation;
  row: number;       // top-left row on grid
  col: number;       // top-left col on grid
  fallInterval: number; // current ms between ticks (decreases on penalty)
  retries: number;   // wrong-answer retries used
  frozen: boolean;
}

// ─── Tetromino Shapes ────────────────────────────────────────────────────────

const SHAPES: Record<TetrominoType, number[][]> = {
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  O: [
    [1, 1],
    [1, 1],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0],
  ],
};

const TETROMINO_COLORS: Record<TetrominoType, string> = {
  I: Colors.brickI,
  O: Colors.brickO,
  T: Colors.brickT,
  S: Colors.brickS,
  Z: Colors.brickZ,
  J: Colors.brickJ,
  L: Colors.brickL,
};

const TYPES: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

// ─── Rotation ────────────────────────────────────────────────────────────────

export function rotateCW(matrix: number[][]): number[][] {
  const n = matrix.length;
  return matrix[0].map((_, col) => matrix.map(row => row[col]).reverse());
}

// ─── Factory ─────────────────────────────────────────────────────────────────

export function randomTetromino(): Tetromino {
  const type = TYPES[Math.floor(Math.random() * TYPES.length)];
  return {
    type,
    color: TETROMINO_COLORS[type],
    matrix: SHAPES[type].map(r => [...r]),
  };
}

export function createFallingBrick(
  tetromino: Tetromino,
  equation: Equation,
  startCol: number,
  baseInterval: number,
): FallingBrick {
  return {
    tetromino,
    equation,
    row: 0,
    col: startCol,
    fallInterval: baseInterval,
    retries: 0,
    frozen: false,
  };
}

/** Apply wrong-answer speed penalty */
export function applySpeedPenalty(brick: FallingBrick): FallingBrick {
  const newInterval = Math.max(150, Math.round(brick.fallInterval * (1 - 0.12)));
  return { ...brick, fallInterval: newInterval, retries: brick.retries + 1 };
}
