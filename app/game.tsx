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
import { MathMasteryModel } from '../engine/mlModel';
import { triggerSuccessHaptic, triggerErrorHaptic, triggerImpactHaptic } from '../utils/haptics';
import {
  lockBrick,
  clearFullRows,
  isValidPosition,
  isGameOver,
  tryRotate,
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
  COMBO_MULTIPLIER,
  MAX_RETRIES,
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
    nextBrick, setNextBrick,
    score, addScore,
    level, linesCleared, incrementLines,
    combo, isHotStreak, incrementCombo, resetCombo,
    freezeTokens, hintTokens, useFreeze, useHint,
    wrongAnswerFlash, setWrongAnswerFlash,
    setClearedRows,
  } = useGameStore();

  const { recordCorrect, recordWrong, recordSession, addXP, adaptiveModeEnabled, masteryByTopic } = useProgressStore();

  const [hintVisible, setHintVisible] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const feedbackAnim = useRef(new Animated.Value(0)).current;

  // ML model instance
  const mlModel = useRef(new MathMasteryModel()).current;

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

    // Use ML model if Adaptive Mode is enabled
    if (adaptiveModeEnabled) {
      const weightedList = mlModel.getWeightedTopicList(difficulty, masteryByTopic);
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
    const brick = createFallingBrick(tetro, eq, 3, baseInterval);

    if (!isValidPosition(gridRef.current, brick)) {
      endGame();
      return;
    }
    setCurrentBrick(brick);
  }, [difficulty, adaptiveModeEnabled, masteryByTopic, levelUpActive]);

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
      const newGrid = lockBrick(g, brick);
      const { grid: cleared, linesCleared: lines, clearedRows } = clearFullRows(newGrid);

      if (lines > 0) {
        playSound('clear');
        setClearedRows(clearedRows);
        const pts = SCORE.rowClearMulti(lines) * (isHotStreak ? COMBO_MULTIPLIER : 1);
        addScore(pts);
        incrementLines(lines);
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
  }, [spawnBrick, isHotStreak, levelUpActive]);

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
    if (levelUpActive) return;
    const brick = brickRef.current;
    if (!brick) return;

    const correct = validateAnswer(brick.equation, input);

    if (correct) {
      triggerSuccessHaptic();
      const pts = SCORE.lockCorrect * (isHotStreak ? COMBO_MULTIPLIER : 1);
      addScore(pts);
      incrementCombo();
      recordCorrect(brick.equation.topic); // async — fire and forget
      addXP(5);
      showFeedback('✓ Correct!', Colors.success);
      playSound('lock');
      if (isHotStreak) playSound('streak');
    } else {
      triggerErrorHaptic();
      if (brick.retries < MAX_RETRIES) {
        const penalised = applySpeedPenalty(brick);
        setCurrentBrick(penalised);
        setWrongAnswerFlash(true);
        setTimeout(() => setWrongAnswerFlash(false), 500);
        startTick(penalised.fallInterval);
        showFeedback('✗ Try again!', Colors.danger);
        playSound('wrong');
      } else {
        // Out of retries — log wrong answer
        recordWrong({
          equation: brick.equation.display,
          userAnswer: input,
          correctAnswer: brick.equation.answer,
          topic: brick.equation.topic,
          difficulty,
          timestamp: Date.now(),
        });
        resetCombo();
        showFeedback(`Answer: ${brick.equation.answer}`, Colors.warning);
        playSound('wrong');
      }
    }
  }, [isHotStreak, difficulty, levelUpActive]);

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

    // Compute session accuracy from in-memory wrong-answer log
    const state = useProgressStore.getState();
    const sessionWrong = state.wrongAnswerLog.filter(
      w => Date.now() - w.timestamp < 3_600_000,
    ).length;
    const sessionTotal = Math.max(sessionWrong, 1);
    const accuracy = Math.max(0, 1 - sessionWrong / sessionTotal);

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
      {/* Header */}
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
        <Text style={[styles.headerTitle, { fontFamily: headingFont }]}>MATHRIS</Text>
        <View style={styles.headerRight} />
      </View>

      <HUD
        score={score}
        level={level}
        combo={combo}
        isHotStreak={isHotStreak}
        freezeTokens={freezeTokens}
        hintTokens={hintTokens}
        nextBrick={nextBrick}
      />

      {/* Board */}
      <View style={styles.boardWrapper}>
        <GameBoard grid={grid} currentBrick={currentBrick} wrongFlash={wrongAnswerFlash} />
      </View>

      {/* Feedback banner */}
      {feedbackMsg && (
        <Animated.View style={[styles.feedbackBanner, { opacity: feedbackAnim }]}>
          <Text style={[styles.feedbackText, { fontFamily: headingFont }]}>{feedbackMsg}</Text>
        </Animated.View>
      )}

      {/* Brick controls */}
      <View style={styles.controls}>
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

      {/* Power-up bar */}
      <View style={styles.powerRow}>
        <TouchableOpacity
          style={[styles.powerBtn, freezeTokens === 0 && styles.powerBtnDim]}
          onPress={handleFreeze}
        >
          <Text style={styles.powerIcon}>🧊</Text>
          <Text style={[styles.powerLabel, { fontFamily: bodyFont }]}>Freeze ({freezeTokens})</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.powerBtn, hintTokens === 0 && styles.powerBtnDim]}
          onPress={handleHint}
        >
          <Text style={styles.powerIcon}>💡</Text>
          <Text style={[styles.powerLabel, { fontFamily: bodyFont }]}>Hint ({hintTokens})</Text>
        </TouchableOpacity>
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
    paddingVertical: Spacing.sm,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.full,
  },
  backBtnText: {
    color: Colors.muted,
    fontSize: FontSize.md,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: Colors.white,
    fontSize: FontSize.lg,
    letterSpacing: 4,
  },
  headerRight: { width: 36 },
  boardWrapper: {
    alignItems: 'center',
    marginVertical: Spacing.xs,
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
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.xl,
    marginVertical: Spacing.xs,
  },
  controlBtn: {
    flex: 1,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.bgBorder,
  },
  controlText: {
    color: Colors.offWhite,
    fontSize: FontSize.lg,
  },
  powerRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.sm,
  },
  powerBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.bgBorder,
  },
  powerBtnDim: { opacity: 0.35 },
  powerIcon: { fontSize: 16 },
  powerLabel: {
    color: Colors.offWhite,
    fontSize: FontSize.sm,
  },
});
