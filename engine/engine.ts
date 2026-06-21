import { GRID_COLS, GRID_ROWS } from '../constants/config';
import type { FallingBrick } from './bricks';
import { rotateCW } from './bricks';

// ─── Types ───────────────────────────────────────────────────────────────────

/** null = empty cell, string = hex color of locked brick */
export type Cell = null | string;
export type Grid = Cell[][];

export interface ClearResult {
  grid: Grid;
  linesCleared: number;
  clearedRows: number[];
}

// ─── Grid Helpers ─────────────────────────────────────────────────────────────

export function createEmptyGrid(): Grid {
  return Array.from({ length: GRID_ROWS }, () => Array(GRID_COLS).fill(null));
}

/** Get the actual occupied cells of a brick's tetromino at its grid position */
export function getBrickCells(brick: FallingBrick): Array<{ row: number; col: number }> {
  const cells: Array<{ row: number; col: number }> = [];
  brick.tetromino.matrix.forEach((rowArr, r) => {
    rowArr.forEach((cell, c) => {
      if (cell) cells.push({ row: brick.row + r, col: brick.col + c });
    });
  });
  return cells;
}

/** Check if a brick position is valid (no collision, in bounds) */
export function isValidPosition(grid: Grid, brick: FallingBrick, dRow = 0, dCol = 0): boolean {
  return getBrickCells(brick).every(({ row, col }) => {
    const r = row + dRow;
    const c = col + dCol;
    return r >= 0 && r < GRID_ROWS && c >= 0 && c < GRID_COLS && grid[r][c] === null;
  });
}

/** Lock a brick into the grid */
export function lockBrick(grid: Grid, brick: FallingBrick): Grid {
  const newGrid = grid.map(r => [...r]);
  getBrickCells(brick).forEach(({ row, col }) => {
    if (row >= 0 && row < GRID_ROWS && col >= 0 && col < GRID_COLS) {
      newGrid[row][col] = brick.tetromino.color;
    }
  });
  return newGrid;
}

/** Clear completed rows, return new grid + count */
export function clearFullRows(grid: Grid): ClearResult {
  const clearedRows: number[] = [];
  const remaining = grid.filter((row, idx) => {
    if (row.every(c => c !== null)) {
      clearedRows.push(idx);
      return false;
    }
    return true;
  });
  const linesCleared = clearedRows.length;
  const empty = Array.from({ length: linesCleared }, () => Array<Cell>(GRID_COLS).fill(null));
  return {
    grid: [...empty, ...remaining],
    linesCleared,
    clearedRows,
  };
}

/** Try to rotate a brick (SRS-style: try centre, then kick offsets) */
export function tryRotate(grid: Grid, brick: FallingBrick): FallingBrick | null {
  const rotated = rotateCW(brick.tetromino.matrix);
  const candidate: FallingBrick = {
    ...brick,
    tetromino: { ...brick.tetromino, matrix: rotated },
  };
  const kicks = [0, 1, -1, 2, -2];
  for (const dCol of kicks) {
    if (isValidPosition(grid, candidate, 0, dCol)) {
      return { ...candidate, col: candidate.col + dCol };
    }
  }
  return null;
}

/** Get ghost piece row (where brick would land) */
export function getGhostRow(grid: Grid, brick: FallingBrick): number {
  let drop = 0;
  while (isValidPosition(grid, brick, drop + 1, 0)) drop++;
  return brick.row + drop;
}

/** Check if any cell in row 0 is occupied (game over) */
export function isGameOver(grid: Grid): boolean {
  return grid[0].some(cell => cell !== null);
}
