import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useProgressStore, useFontFamily } from '../store/progressStore';
import { useGameStore } from '../store/gameStore';
import type { WrongAnswerEntry } from '../data/repository';
import { Colors, FontSize, Spacing, Radius } from '../constants/theme';
import { STARS } from '../constants/config';
import { triggerImpactHaptic } from '../utils/haptics';

function computeStars(accuracy: number): number {
  if (accuracy >= STARS.three) return 3;
  if (accuracy >= STARS.two) return 2;
  return 1;
}

export default function ReviewScreen() {
  const router = useRouter();
  const { score, resetGame } = useGameStore();
  const { wrongAnswerLog, sessionHistory, clearWrongLog } = useProgressStore();

  // Typography for dyslexia accessibility
  const headingFont = useFontFamily('heading');
  const headingMediumFont = useFontFamily('headingMedium');
  const bodyFont = useFontFamily('body');
  const monoFont = useFontFamily('mono');
  const monoBoldFont = useFontFamily('monoBold');

  const lastSession = sessionHistory[0];
  const accuracy = lastSession?.accuracy ?? 0;
  const stars = computeStars(accuracy);

  // Wrong answers from the most recent session (last hour)
  const sessionWrong: WrongAnswerEntry[] = wrongAnswerLog.filter(
    (w: WrongAnswerEntry) => Date.now() - w.timestamp < 3_600_000,
  );

  const handlePlayAgain = () => {
    triggerImpactHaptic();
    resetGame();
    router.replace('/game');
  };

  const handleMenu = () => {
    triggerImpactHaptic();
    router.replace('/');
  };

  const handleClear = () => {
    triggerImpactHaptic();
    clearWrongLog();
  };

  const handleDashboard = () => {
    triggerImpactHaptic();
    router.push('/dashboard');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Game over header */}
        <View style={styles.header}>
          <Text style={[styles.title, { fontFamily: headingMediumFont }]}>GAME OVER</Text>
          <Text style={[styles.score, { fontFamily: monoBoldFont }]}>{score.toLocaleString()}</Text>
          <Text style={[styles.scoreLabel, { fontFamily: headingMediumFont }]}>POINTS</Text>
          <Text style={[styles.accuracy, { fontFamily: bodyFont }]}>
            {Math.round(accuracy * 100)}% accuracy
          </Text>
        </View>

        {/* CTA buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.playAgainBtn} onPress={handlePlayAgain}>
            <Text style={[styles.playAgainText, { fontFamily: headingFont }]}>Play again</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuBtn} onPress={handleMenu}>
            <Text style={[styles.menuBtnText, { fontFamily: headingMediumFont }]}>Menu</Text>
          </TouchableOpacity>
        </View>

        {/* Wrong answer review */}
        {sessionWrong.length > 0 ? (
          <View style={styles.reviewSection}>
            <Text style={[styles.reviewTitle, { fontFamily: headingFont }]}>Let's review</Text>
            <Text style={[styles.reviewSubtitle, { fontFamily: bodyFont }]}>
              {sessionWrong.length} equation{sessionWrong.length !== 1 ? 's' : ''} to revisit
            </Text>
            {sessionWrong.map((entry, i) => (
              <View key={i} style={styles.wrongCard}>
                <Text style={[styles.wrongEquation, { fontFamily: monoFont }]}>{entry.equation}</Text>
                <View style={styles.wrongAnswerRow}>
                  <View style={styles.wrongAnswerBox}>
                    <Text style={[styles.wrongAnswerLabel, { fontFamily: bodyFont }]}>Your answer</Text>
                    <Text style={[styles.wrongAnswerValue, { color: Colors.danger, fontFamily: monoBoldFont }]}>
                      {entry.userAnswer || '—'}
                    </Text>
                  </View>
                  <Text style={[styles.wrongArrow, { fontFamily: monoFont }]}>→</Text>
                  <View style={styles.wrongAnswerBox}>
                    <Text style={[styles.wrongAnswerLabel, { fontFamily: bodyFont }]}>Correct answer</Text>
                    <Text style={[styles.wrongAnswerValue, { color: Colors.success, fontFamily: monoBoldFont }]}>
                      {entry.correctAnswer}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
            <TouchableOpacity style={styles.clearBtn} onPress={handleClear}>
              <Text style={[styles.clearBtnText, { fontFamily: bodyFont }]}>Clear review list</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.perfectBox}>
            <Text style={styles.perfectEmoji}>🎉</Text>
            <Text style={[styles.perfectTitle, { fontFamily: headingFont }]}>Perfect round!</Text>
            <Text style={[styles.perfectSubtitle, { fontFamily: bodyFont }]}>No mistakes this session.</Text>
          </View>
        )}

        {/* Dashboard link */}
        <TouchableOpacity
          style={styles.dashboardBtn}
          onPress={handleDashboard}
        >
          <Text style={[styles.dashboardBtnText, { fontFamily: headingMediumFont }]}>View progress dashboard</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  container: {
    padding: Spacing.xl,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.xl,
  },
  header: {
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.xl,
  },
  title: {
    color: Colors.muted,
    fontSize: FontSize.sm,
    letterSpacing: 4,
  },
  score: {
    color: Colors.primary,
    fontSize: 48,
    marginTop: Spacing.md,
  },
  scoreLabel: {
    color: Colors.muted,
    fontSize: FontSize.xs,
    letterSpacing: 2,
    marginTop: -4,
    marginBottom: Spacing.sm,
  },
  accuracy: {
    color: Colors.offWhite,
    fontSize: FontSize.md,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  playAgainBtn: {
    flex: 2,
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  playAgainText: {
    color: Colors.white,
    fontSize: FontSize.lg,
  },
  menuBtn: {
    flex: 1,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.bgBorder,
  },
  menuBtnText: {
    color: Colors.offWhite,
    fontSize: FontSize.lg,
  },
  reviewSection: {
    gap: Spacing.md,
  },
  reviewTitle: {
    color: Colors.white,
    fontSize: FontSize.xl,
  },
  reviewSubtitle: {
    color: Colors.muted,
    fontSize: FontSize.sm,
  },
  wrongCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.bgBorder,
    gap: Spacing.md,
  },
  wrongEquation: {
    color: Colors.offWhite,
    fontSize: FontSize.lg,
  },
  wrongAnswerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  wrongAnswerBox: {
    flex: 1,
    backgroundColor: Colors.bgSurface,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    alignItems: 'center',
  },
  wrongAnswerLabel: {
    color: Colors.muted,
    fontSize: FontSize.xs,
  },
  wrongAnswerValue: {
    fontSize: FontSize.lg,
    marginTop: 2,
  },
  wrongArrow: {
    color: Colors.muted,
    fontSize: FontSize.lg,
  },
  clearBtn: {
    alignSelf: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  clearBtnText: {
    color: Colors.muted,
    fontSize: FontSize.sm,
    textDecorationLine: 'underline',
  },
  perfectBox: {
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl,
    padding: Spacing.xxl,
    borderWidth: 1,
    borderColor: Colors.easy,
    gap: Spacing.sm,
  },
  perfectEmoji: { fontSize: 56 },
  perfectTitle: {
    color: Colors.white,
    fontSize: FontSize.xxl,
  },
  perfectSubtitle: {
    color: Colors.muted,
    fontSize: FontSize.md,
  },
  dashboardBtn: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.bgBorder,
  },
  dashboardBtnText: {
    color: Colors.offWhite,
    fontSize: FontSize.md,
  },
});
