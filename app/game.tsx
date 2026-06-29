import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useGameStore } from '../store/gameStore';
import { useProgressStore, useFontFamily } from '../store/progressStore';
import GameBoard from '../components/GameBoard';
import Keypad from '../components/Keypad';
import HUD from '../components/HUD';
import HintModal from '../components/HintModal';
import LevelUpOverlay from '../components/LevelUpOverlay';
import { getWeightedTopicList } from '../engine/mlModel';
import { triggerSuccessHaptic, triggerErrorHaptic, triggerImpactHaptic } from '../utils/haptics';
import {
  lockBrick,
  isValidPosition,
  isGameOver,
  tryRotate,
  applyGridGravity,
  clearLinesChain,
  getBrickCells,
} from '../engine/engine';
import {
  randomTetromino,
  createFallingBrick,
  applySpeedPenalty,
} from '../engine/bricks';
import { generateEquation, validateAnswer } from '../engine/equations';
import { playSound } from '../engine/audio';
import {
  TICK_INTERVAL_MS,
  FREEZE_DURATION_MS,
  SCORE,
  HINT_SCORE_COST,
  GRID_COLS,
  GRID_ROWS,
} from '../constants/config';
import { Colors, FontSize, Spacing, Radius } from '../constants/theme';

export default function GameScreen() {
  const router = useRouter();

  // Typography for dyslexia
  const headingFont = useFontFamily('heading');
  const bodyFont = useFontFamily('body');
  const monoBoldFont = useFontFamily('monoBold');

  // Game store
  const {
    phase, setPhase, difficulty,
    grid, setGrid,
    currentBrick, setCurrentBrick,
    score, addScore,
    level, linesCleared, incrementLines,
    combo, isHotStreak, incrementCombo, resetCombo,
    correctCount, incrementCorrectCount,
    freezeTokens, hintTokens, useFreeze, useHint,
    wrongAnswerFlash, setWrongAnswerFlash,
    practiceTopic,
  } = useGameStore();

  const { recordCorrect, recordSession, addXP, adaptiveModeEnabled, masteryByTopic } = useProgressStore();

  const [hintVisible, setHintVisible] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const feedbackAnim = useRef(new Animated.Value(0)).current;

  // Burst animation state
  const [bursts, setBursts] = useState<Array<{ id: string; row: number; col: number; color: string }>>([]);

  const triggerBurstAnimation = useCallback((cells: Array<{ row: number; col: number }>, color: string) => {
    const newBursts = cells.map(cell => ({
      id: `${cell.row}-${cell.col}-${Date.now()}-${Math.random()}`,
      row: cell.row,
      col: cell.col,
      color,
    }));
    setBursts(prev => [...prev, ...newBursts]);
    setTimeout(() => {
      setBursts(prev => prev.filter(b => !newBursts.includes(b)));
    }, 450);
  }, []);


  // Level Up State
  const [levelUpActive, setLevelUpActive] = useState(false);
  const prevLevelRef = useRef(level);

  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const frozenRef = useRef(false);
  const brickRef = useRef(currentBrick);
  const gridRef = useRef(grid);

  // Keep refs in sync
  useEffect(() => { brickRef.current = currentBrick; }, [currentBrick]);
  useEffect(() => { gridRef.current = grid; }, [grid]);

  // Detect Level Up during game
  useEffect(() => {
    if (level > prevLevelRef.current && phase === 'playing') {
      triggerSuccessHaptic();
      setLevelUpActive(true);
      prevLevelRef.current = level;
    }
  }, [level, phase]);

  // ─── Spawn Next Brick ───────────────────────────────────────────────────────
  const spawnBrick = useCallback(() => {
    if (levelUpActive) return;

    const baseInterval = TICK_INTERVAL_MS[difficulty];
    let eq;

    if (practiceTopic) {
      eq = generateEquation(difficulty, practiceTopic);
    } else if (adaptiveModeEnabled) {
      // Use ML model if Adaptive Mode is enabled
      const weightedList = getWeightedTopicList(difficulty, masteryByTopic);
      if (weightedList.length > 0) {
        // Weighted random selection
        const totalWeight = weightedList.reduce((sum, item) => sum + item.weight, 0);
        let randomVal = Math.random() * totalWeight;
        let selectedTopic = weightedList[0].topic;

        for (const item of weightedList) {
          randomVal -= item.weight;
          if (randomVal <= 0) {
            selectedTopic = item.topic;
            break;
          }
        }
        eq = generateEquation(difficulty, selectedTopic as any);
      } else {
        eq = generateEquation(difficulty);
      }
    } else {
      eq = generateEquation(difficulty);
    }

    const tetro = randomTetromino();
    
    // Choose a random starting column that keeps the tetromino within bounds
    const maxStartCol = GRID_COLS - tetro.matrix.length;
    const cols = Array.from({ length: maxStartCol + 1 }, (_, i) => i);
    
    // Shuffle possible start columns to find a valid one
    for (let i = cols.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cols[i], cols[j]] = [cols[j], cols[i]];
    }

    const pieceId = `piece-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    let brick = null;
    for (const startCol of cols) {
      const candidate = createFallingBrick(tetro, eq, startCol, baseInterval, pieceId);
      if (isValidPosition(gridRef.current, candidate)) {
        brick = candidate;
        break;
      }
    }

    if (!brick) {
      endGame();
      return;
    }
    setCurrentBrick(brick);
  }, [difficulty, adaptiveModeEnabled, masteryByTopic, levelUpActive, practiceTopic]);

  // ─── Game Loop Tick ─────────────────────────────────────────────────────────
  const tick = useCallback(() => {
    if (frozenRef.current || levelUpActive) return;
    const brick = brickRef.current;
    const g = gridRef.current;
    if (!brick) return;

    if (isValidPosition(g, brick, 1, 0)) {
      setCurrentBrick({ ...brick, row: brick.row + 1 });
    } else {
      // Lock the brick
      const newGrid = lockBrick(g, brick, brick.pieceId);
      const { grid: cleared, linesCleared: lines, clearedCellPositions } = clearLinesChain(newGrid);

      if (lines > 0) {
        playSound('clear');
        const pts = lines * 100; // 100 points per line clear!
        addScore(pts);
        incrementLines(lines);
        triggerBurstAnimation(clearedCellPositions, Colors.white);
      }

      playSound('lock');
      setGrid(cleared);
      setCurrentBrick(null);

      if (isGameOver(cleared)) {
        endGame();
      } else {
        setTimeout(spawnBrick, 100);
      }
    }
  }, [spawnBrick, levelUpActive, triggerBurstAnimation]);

  // ─── Start / Restart Tick Interval ─────────────────────────────────────────
  const startTick = useCallback((interval: number) => {
    if (tickRef.current) clearInterval(tickRef.current);
    if (!levelUpActive) {
      tickRef.current = setInterval(tick, interval);
    }
  }, [tick, levelUpActive]);

  // Resume game after Level Up closes
  const handleCloseLevelUp = () => {
    setLevelUpActive(false);
    triggerImpactHaptic();
    if (currentBrick) {
      startTick(currentBrick.fallInterval);
    } else {
      spawnBrick();
    }
  };

  // Pause tick loop when Level Up overlay is active
  useEffect(() => {
    if (levelUpActive && tickRef.current) {
      clearInterval(tickRef.current);
    } else if (!levelUpActive && currentBrick && phase === 'playing') {
      startTick(currentBrick.fallInterval);
    }
  }, [levelUpActive]);

  // ─── Answer Submit ──────────────────────────────────────────────────────────
  const handleAnswer = useCallback((input: string) => {
    if (levelUpActive || phase !== 'playing') return;
    
    // Check current falling brick first
    const brick = brickRef.current;
    if (brick && validateAnswer(brick.equation, input)) {
      triggerSuccessHaptic();
      
      const cellsToBurst = getBrickCells(brick);
      triggerBurstAnimation(cellsToBurst, brick.tetromino.color);
      
      addScore(10); // 10 points for air solve
      incrementCombo();
      incrementCorrectCount();
      recordCorrect(brick.equation.topic); // async — fire and forget
      addXP(5);
      showFeedback('✓ Solved in Air! +10', Colors.success);
      playSound('clear');
      
      setCurrentBrick(null);
      setTimeout(spawnBrick, 100);
      return;
    }

    // Scan grid for locked pieces matching the answer
    const g = gridRef.current;
    let foundPieceId: string | null = null;
    let foundColor: string = Colors.primary;
    let foundTopic: any = null;
    
    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        const cell = g[r][c];
        if (cell && validateAnswer(cell.equation, input)) {
          foundPieceId = cell.pieceId;
          foundColor = cell.color;
          foundTopic = cell.equation.topic;
          break;
        }
      }
      if (foundPieceId) break;
    }

    if (foundPieceId) {
      triggerSuccessHaptic();
      
      const cellsToBurst: Array<{ row: number; col: number }> = [];
      const newGrid = g.map((row, r) => row.map((cell, c) => {
        if (cell && cell.pieceId === foundPieceId) {
          cellsToBurst.push({ row: r, col: c });
          return null;
        }
        return cell;
      }));

      triggerBurstAnimation(cellsToBurst, foundColor);
      
      addScore(5); // 5 points for ground solve
      incrementCombo();
      incrementCorrectCount();
      recordCorrect(foundTopic);
      addXP(3);
      showFeedback('✓ Solved on Ground! +5', Colors.success);
      playSound('clear');
      
      // Apply gravity
      let collapsedGrid = applyGridGravity(newGrid);
      
      // Check for row clears
      const chainResult = clearLinesChain(collapsedGrid);
      if (chainResult.linesCleared > 0) {
        playSound('clear');
        const pts = chainResult.linesCleared * 100; // 100 points per line clear
        addScore(pts);
        incrementLines(chainResult.linesCleared);
        triggerBurstAnimation(chainResult.clearedCellPositions, Colors.white);
        collapsedGrid = chainResult.grid;
      }

      setGrid(collapsedGrid);
      return;
    }

    // Wrong answer - no match
    triggerErrorHaptic();
    resetCombo();
    showFeedback('✗ No matching equation!', Colors.danger);
    playSound('wrong');
  }, [levelUpActive, phase, spawnBrick, triggerBurstAnimation]);

  // ─── Feedback Banner ────────────────────────────────────────────────────────
  const showFeedback = (msg: string, _color: string) => {
    setFeedbackMsg(msg);
    feedbackAnim.setValue(1);
    Animated.timing(feedbackAnim, { toValue: 0, duration: 1500, useNativeDriver: true }).start(
      () => setFeedbackMsg(null),
    );
  };

  // ─── Freeze ─────────────────────────────────────────────────────────────────
  const handleFreeze = () => {
    if (levelUpActive || freezeTokens <= 0 || frozenRef.current) return;
    triggerImpactHaptic();
    useFreeze();
    frozenRef.current = true;
    if (brickRef.current) setCurrentBrick({ ...brickRef.current, frozen: true });
    playSound('freeze');
    setTimeout(() => {
      frozenRef.current = false;
      if (brickRef.current) setCurrentBrick({ ...brickRef.current, frozen: false });
    }, FREEZE_DURATION_MS);
  };

  // ─── Hint ───────────────────────────────────────────────────────────────────
  const handleHint = () => {
    if (levelUpActive || hintTokens <= 0) return;
    triggerImpactHaptic();
    useHint();
    addScore(-HINT_SCORE_COST);
    playSound('hint');
    setHintVisible(true);
  };

  // ─── Swipe / Move Controls ──────────────────────────────────────────────────
  const moveLeft = () => {
    if (levelUpActive) return;
    triggerImpactHaptic();
    const brick = brickRef.current;
    if (brick && isValidPosition(gridRef.current, brick, 0, -1)) {
      setCurrentBrick({ ...brick, col: brick.col - 1 });
    }
  };
  const moveRight = () => {
    if (levelUpActive) return;
    triggerImpactHaptic();
    const brick = brickRef.current;
    if (brick && isValidPosition(gridRef.current, brick, 0, 1)) {
      setCurrentBrick({ ...brick, col: brick.col + 1 });
    }
  };
  const rotateBrick = () => {
    if (levelUpActive) return;
    triggerImpactHaptic();
    const brick = brickRef.current;
    if (!brick) return;
    const rotated = tryRotate(gridRef.current, brick);
    if (rotated) setCurrentBrick(rotated);
  };
  const hardDrop = () => {
    if (levelUpActive) return;
    triggerImpactHaptic();
    const brick = brickRef.current;
    if (!brick) return;
    let drop = 0;
    while (isValidPosition(gridRef.current, brick, drop + 1, 0)) drop++;
    setCurrentBrick({ ...brick, row: brick.row + drop });
    // Immediately trigger tick
    tick();
  };

  // ─── End Game ───────────────────────────────────────────────────────────────
  const endGame = useCallback(async () => {
    if (tickRef.current) clearInterval(tickRef.current);
    setPhase('gameover');
    playSound('gameover');

    // Compute session accuracy from correct/wrong counts
    const gameState = useGameStore.getState();
    const sessionCorrect = gameState.correctCount;
    const state = useProgressStore.getState();
    const sessionWrong = state.wrongAnswerLog.filter(
      w => Date.now() - w.timestamp < 3_600_000,
    ).length;
    const sessionTotal = sessionCorrect + sessionWrong;
    const accuracy = sessionTotal > 0 ? sessionCorrect / sessionTotal : 0;

    // Persist session and XP — async, no need to await before navigating
    recordSession(score, accuracy);

    router.replace('/review');
  }, [score]);

  // ─── Lifecycle ──────────────────────────────────────────────────────────────
  useEffect(() => {
    setPhase('playing');
    spawnBrick();
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, []);

  useEffect(() => {
    if (currentBrick && phase === 'playing' && !levelUpActive) {
      startTick(currentBrick.fallInterval);
    }
  }, [currentBrick?.fallInterval, phase, levelUpActive]);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Minimal Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            triggerImpactHaptic();
            if (tickRef.current) clearInterval(tickRef.current);
            router.back();
          }}
          style={styles.backBtn}
        >
          <Text style={styles.backBtnText}>✕</Text>
        </TouchableOpacity>
      </View>

      <HUD
        score={score}
        level={level}
        combo={combo}
        isHotStreak={isHotStreak}
        freezeTokens={freezeTokens}
        hintTokens={hintTokens}
      />

      {/* Equation Chalk Strip */}
      <View style={styles.chalkStrip}>
        <Text style={[styles.chalkLabel, { fontFamily: bodyFont }]}>EQUATION</Text>
        <Text style={[styles.chalkEquation, { fontFamily: monoBoldFont }]}>
          {currentBrick ? currentBrick.equation.display.replace(/\n/g, '   |   ') : '—'}
        </Text>
      </View>

      {/* Board */}
      <View style={styles.boardWrapper}>
        <GameBoard grid={grid} currentBrick={currentBrick} wrongFlash={wrongAnswerFlash} bursts={bursts} />
      </View>

      {/* Feedback banner */}
      {feedbackMsg && (
        <Animated.View style={[styles.feedbackBanner, { opacity: feedbackAnim }]}>
          <Text style={[styles.feedbackText, { fontFamily: headingFont }]}>{feedbackMsg}</Text>
        </Animated.View>
      )}

      {/* Brick controls and Power-ups aligned */}
      <View style={styles.controlsRow}>
        <View style={styles.controlsGroup}>
          <TouchableOpacity style={styles.controlBtn} onPress={moveLeft}>
            <Text style={[styles.controlText, { fontFamily: monoBoldFont }]}>◀</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlBtn} onPress={rotateBrick}>
            <Text style={[styles.controlText, { fontFamily: monoBoldFont }]}>↻</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlBtn} onPress={hardDrop}>
            <Text style={[styles.controlText, { fontFamily: monoBoldFont }]}>▼▼</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlBtn} onPress={moveRight}>
            <Text style={[styles.controlText, { fontFamily: monoBoldFont }]}>▶</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.powerGroup}>
          <TouchableOpacity
            style={[styles.powerBtn, freezeTokens === 0 && styles.powerBtnDim]}
            onPress={handleFreeze}
          >
            <Text style={[styles.powerLabel, { fontFamily: bodyFont }]}>Freeze ({freezeTokens})</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.powerBtn, hintTokens === 0 && styles.powerBtnDim]}
            onPress={handleHint}
          >
            <Text style={[styles.powerLabel, { fontFamily: bodyFont }]}>Hint ({hintTokens})</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Answer keypad */}
      <Keypad difficulty={difficulty} onSubmit={handleAnswer} />

      {/* Hint modal */}
      <HintModal
        visible={hintVisible}
        hints={currentBrick?.equation.hints ?? []}
        scoreDeduction={HINT_SCORE_COST}
        onClose={() => setHintVisible(false)}
      />

      {/* Level Up overlay */}
      {levelUpActive && (
        <LevelUpOverlay newLevel={level} onClose={handleCloseLevelUp} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
  },
  backBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.bgBorder,
  },
  backBtnText: {
    color: Colors.muted,
    fontSize: FontSize.md,
  },
  boardWrapper: {
    alignItems: 'center',
    marginVertical: Spacing.xs,
  },
  chalkStrip: {
    backgroundColor: Colors.primary,
    marginHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
  },
  chalkLabel: {
    color: 'rgba(232, 228, 220, 0.75)', // chalky off-white with transparency
    fontSize: FontSize.xs,
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  chalkEquation: {
    color: Colors.white,
    fontSize: FontSize.lg,
    letterSpacing: 0.5,
  },
  feedbackBanner: {
    position: 'absolute',
    top: 140,
    alignSelf: 'center',
    backgroundColor: Colors.bgCard,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.bgBorder,
  },
  feedbackText: {
    color: Colors.white,
    fontSize: FontSize.md,
  },
  controlsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    marginVertical: Spacing.xs,
  },
  controlsGroup: {
    flex: 3,
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  controlBtn: {
    flex: 1,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.bgBorder,
  },
  controlText: {
    color: Colors.offWhite,
    fontSize: FontSize.md,
  },
  powerGroup: {
    flex: 2,
    flexDirection: 'column',
    gap: Spacing.xs,
  },
  powerBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: Colors.bgBorder,
  },
  powerBtnDim: { opacity: 0.35 },
  powerLabel: {
    color: Colors.offWhite,
    fontSize: FontSize.xs - 1,
  },
});
