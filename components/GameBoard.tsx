import React, { useMemo } from 'react';
import { Canvas, RoundedRect } from '@shopify/react-native-skia';
import { useWindowDimensions } from 'react-native';
import { GRID_COLS, GRID_ROWS } from '../constants/config';
import { Colors } from '../constants/theme';
import type { Grid } from '../engine/engine';
import { getBrickCells, getGhostRow } from '../engine/engine';
import type { FallingBrick } from '../engine/bricks';

interface Props {
  grid: Grid;
  currentBrick: FallingBrick | null;
  wrongFlash: boolean;
}

export default function GameBoard({ grid, currentBrick, wrongFlash }: Props) {
  const { width } = useWindowDimensions();
  const boardWidth = Math.floor(width * 0.8);
  const cellSize = Math.floor(boardWidth / GRID_COLS);
  const boardHeight = cellSize * GRID_ROWS;

  const ghostRow = useMemo(
    () => (currentBrick ? getGhostRow(grid, currentBrick) : null),
    [grid, currentBrick],
  );

  const currentCells = useMemo(
    () => (currentBrick ? getBrickCells(currentBrick) : []),
    [currentBrick],
  );

  return (
    <Canvas style={{ width: boardWidth, height: boardHeight }}>
      {/* Background grid — dark board cells */}
      {Array.from({ length: GRID_ROWS }).map((_, r) =>
        Array.from({ length: GRID_COLS }).map((__, c) => (
          <RoundedRect
            key={`bg-${r}-${c}`}
            x={c * cellSize + 1}
            y={r * cellSize + 1}
            width={cellSize - 2}
            height={cellSize - 2}
            r={2}
            color={Colors.board}
          />
        )),
      )}

      {/* Locked cells */}
      {grid.map((row, r) =>
        row.map((cell, c) =>
          cell ? (
            <RoundedRect
              key={`cell-${r}-${c}`}
              x={c * cellSize + 1}
              y={r * cellSize + 1}
              width={cellSize - 2}
              height={cellSize - 2}
              r={3}
              color={cell}
            />
          ) : null,
        ),
      )}

      {/* Ghost piece */}
      {currentBrick &&
        ghostRow !== null &&
        currentCells.map(({ row, col }) => {
          const ghostR = ghostRow + (row - currentBrick.row);
          return (
            <RoundedRect
              key={`ghost-${ghostR}-${col}`}
              x={col * cellSize + 1}
              y={ghostR * cellSize + 1}
              width={cellSize - 2}
              height={cellSize - 2}
              r={3}
              color={currentBrick.tetromino.color + '30'}
            />
          );
        })}

      {/* Active brick */}
      {currentBrick &&
        currentCells.map(({ row, col }) => (
          <RoundedRect
            key={`brick-${row}-${col}`}
            x={col * cellSize + 1}
            y={row * cellSize + 1}
            width={cellSize - 2}
            height={cellSize - 2}
            r={3}
            color={wrongFlash ? Colors.danger : currentBrick.tetromino.color}
          />
        ))}
    </Canvas>
  );
}
