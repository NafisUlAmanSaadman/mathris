import React, { useMemo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, useWindowDimensions } from 'react-native';
import { GRID_COLS, GRID_ROWS } from '../constants/config';
import { Colors } from '../constants/theme';
import type { Grid } from '../engine/engine';
import { getBrickCells, getGhostRow } from '../engine/engine';
import type { FallingBrick } from '../engine/bricks';
import type { Equation } from '../engine/equations';

interface BurstingCell {
  id: string;
  row: number;
  col: number;
  color: string;
}

interface Props {
  grid: Grid;
  currentBrick: FallingBrick | null;
  wrongFlash: boolean;
  bursts: BurstingCell[];
}

function BurstCell({ size, color }: { size: number; color: string }) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scale, {
        toValue: 1.8,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scale, opacity]);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        width: size - 2,
        height: size - 2,
        borderRadius: 4,
        backgroundColor: color,
        transform: [{ scale }],
        opacity,
      }}
    />
  );
}

export default function GameBoard({ grid, currentBrick, wrongFlash, bursts }: Props) {
  const { width, height } = useWindowDimensions();
  
  // Calculate cellSize based on both width and height constraints to prevent vertical overflow
  const maxCellWidth = Math.floor((width * 0.8) / GRID_COLS);
  const maxCellHeight = Math.floor((height * 0.42) / GRID_ROWS); // Board takes at most ~42% of height
  const cellSize = Math.min(maxCellWidth, maxCellHeight, 40);
  
  const boardWidth = cellSize * GRID_COLS;
  const boardHeight = cellSize * GRID_ROWS;

  const ghostRow = useMemo(
    () => (currentBrick ? getGhostRow(grid, currentBrick) : null),
    [grid, currentBrick],
  );

  const currentCells = useMemo(
    () => (currentBrick ? getBrickCells(currentBrick) : []),
    [currentBrick],
  );

  // Group locked cells by pieceId to find their visual centers for placing the equation badges
  const pieceCenters = useMemo(() => {
    interface PieceGroup {
      color: string;
      equation: Equation;
      cells: Array<{ r: number; c: number }>;
    }
    const pieces: Record<string, PieceGroup> = {};

    grid.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (cell) {
          if (!pieces[cell.pieceId]) {
            pieces[cell.pieceId] = {
              color: cell.color,
              equation: cell.equation,
              cells: [],
            };
          }
          pieces[cell.pieceId].cells.push({ r, c });
        }
      });
    });

    return Object.entries(pieces).map(([pieceId, group]) => {
      const sumR = group.cells.reduce((sum, cell) => sum + cell.r, 0);
      const sumC = group.cells.reduce((sum, cell) => sum + cell.c, 0);
      const avgR = sumR / group.cells.length;
      const avgC = sumC / group.cells.length;

      return {
        pieceId,
        equation: group.equation,
        color: group.color,
        x: avgC * cellSize + cellSize / 2,
        y: avgR * cellSize + cellSize / 2,
      };
    });
  }, [grid, cellSize]);

  // Center coordinates of the active falling brick
  const activeCenter = useMemo(() => {
    if (!currentBrick || currentCells.length === 0) return null;
    const sumR = currentCells.reduce((sum, cell) => sum + cell.row, 0);
    const sumC = currentCells.reduce((sum, cell) => sum + cell.col, 0);
    const avgR = sumR / currentCells.length;
    const avgC = sumC / currentCells.length;

    return {
      equation: currentBrick.equation,
      color: currentBrick.tetromino.color,
      x: avgC * cellSize + cellSize / 2,
      y: avgR * cellSize + cellSize / 2,
    };
  }, [currentBrick, currentCells, cellSize]);

  return (
    <View style={[styles.board, { width: boardWidth, height: boardHeight }]}>
      {/* Background grid */}
      <View style={styles.gridOverlay}>
        {Array.from({ length: GRID_ROWS }).map((_, r) => (
          <View key={`row-${r}`} style={styles.row}>
            {Array.from({ length: GRID_COLS }).map((__, c) => (
              <View
                key={`bg-${r}-${c}`}
                style={[
                  styles.cell,
                  {
                    width: cellSize - 2,
                    height: cellSize - 2,
                    backgroundColor: Colors.board,
                    margin: 1,
                  },
                ]}
              />
            ))}
          </View>
        ))}
      </View>

      {/* Locked bricks */}
      {grid.map((row, r) =>
        row.map((cell, c) =>
          cell ? (
            <View
              key={`locked-${r}-${c}`}
              style={[
                styles.brickCell,
                {
                  position: 'absolute',
                  left: c * cellSize + 1,
                  top: r * cellSize + 1,
                  width: cellSize - 2,
                  height: cellSize - 2,
                  backgroundColor: cell.color,
                },
              ]}
            />
          ) : null
        )
      )}

      {/* Ghost brick */}
      {currentBrick &&
        ghostRow !== null &&
        currentCells.map(({ row, col }) => {
          const ghostR = ghostRow + (row - currentBrick.row);
          return (
            <View
              key={`ghost-${ghostR}-${col}`}
              style={[
                styles.brickCell,
                {
                  position: 'absolute',
                  left: col * cellSize + 1,
                  top: ghostR * cellSize + 1,
                  width: cellSize - 2,
                  height: cellSize - 2,
                  backgroundColor: currentBrick.tetromino.color,
                  opacity: 0.2,
                },
              ]}
            />
          );
        })}

      {/* Active falling brick */}
      {currentBrick &&
        currentCells.map(({ row, col }) => (
          <View
            key={`active-${row}-${col}`}
            style={[
              styles.brickCell,
              {
                position: 'absolute',
                left: col * cellSize + 1,
                top: row * cellSize + 1,
                width: cellSize - 2,
                height: cellSize - 2,
                backgroundColor: wrongFlash ? Colors.danger : currentBrick.tetromino.color,
              },
            ]}
          />
        ))}

      {/* Bursting cells */}
      {bursts.map(b => (
        <View
          key={b.id}
          style={{
            position: 'absolute',
            left: b.col * cellSize + 1,
            top: b.row * cellSize + 1,
            width: cellSize,
            height: cellSize,
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 8,
          }}
        >
          <BurstCell size={cellSize} color={b.color} />
        </View>
      ))}

      {/* Floating chalk equation badges for locked pieces */}
      {pieceCenters.map(center => (
        <View
          key={`badge-${center.pieceId}`}
          style={[
            styles.equationBadge,
            {
              left: center.x - 45,
              top: center.y - 14,
              borderColor: center.color,
            },
          ]}
        >
          <Text style={styles.badgeText} numberOfLines={2}>
            {center.equation.display.replace(/\n/g, ' ')}
          </Text>
        </View>
      ))}

      {/* Floating chalk equation badge for active brick */}
      {activeCenter && (
        <View
          key="badge-active"
          style={[
            styles.equationBadge,
            {
              left: activeCenter.x - 45,
              top: activeCenter.y - 14,
              borderColor: activeCenter.color,
              backgroundColor: 'rgba(20, 20, 20, 0.95)',
              borderWidth: 2,
            },
          ]}
        >
          <Text style={[styles.badgeText, { color: '#fff', fontSize: 10 }]} numberOfLines={2}>
            {activeCenter.equation.display.replace(/\n/g, ' ')}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    backgroundColor: Colors.bgCard,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.bgBorder,
    overflow: 'hidden',
    position: 'relative',
  },
  gridOverlay: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'column',
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    borderRadius: 2,
  },
  brickCell: {
    borderRadius: 3,
  },
  equationBadge: {
    position: 'absolute',
    width: 90,
    height: 28,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    elevation: 5,
    paddingHorizontal: 2,
  },
  badgeText: {
    color: '#e8e4dc',
    fontSize: 9,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
