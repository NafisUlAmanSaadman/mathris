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
import { useProgressStore } from '../store/progressStore';
import { useGameStore } from '../store/gameStore';
import type { WrongAnswerEntry } from '../data/repository';
import StarRating from '../components/StarRating';
import { Colors, FontFamily, FontSize, Spacing, Radius } from '../constants/theme';
import { STARS } from '../constants/config';

function computeStars(accuracy: number): number {
  if (accuracy >= STARS.three) return 3;
  if (accuracy >= STARS.two) return 2;
  return 1;
}

export default function ReviewScreen() {
  const router = useRouter();
  const { score, resetGame } = useGameStore();
  const { wrongAnswerLog, sessionHistory, clearWrongLog } = useProgressStore();

  const lastSession = sessionHistory[0];
  const accuracy = lastSession?.accuracy ?? 1;
  const stars = computeStars(accuracy);

  // Wrong answers from the most recent session (last hour)
  const sessionWrong: WrongAnswerEntry[] = wrongAnswerLog.filter(
    (w: WrongAnswerEntry) => Date.now() - w.timestamp < 3_600_000,
  );

  const handlePlayAgain = () => {
    resetGame();
    router.replace('/game');
  };

  const handleMenu = () => {
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Game over header */}
        <View style={styles.header}>
          <Text style={styles.title}>Game Over</Text>
          <StarRating count={stars} />
          <Text style={styles.score}>{score.toLocaleString()} pts</Text>
          <Text style={styles.accuracy}>
            {Math.round(accuracy * 100)}% accuracy
          </Text>
        </View>

        {/* CTA buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.playAgainBtn} onPress={handlePlayAgain}>
            <Text style={styles.playAgainText}>▶  Play Again</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuBtn} onPress={handleMenu}>
            <Text style={styles.menuBtnText}>Menu</Text>
          </TouchableOpacity>
        </View>

        {/* Wrong answer review */}
        {sessionWrong.length > 0 ? (
          <View style={styles.reviewSection}>
            <Text style={styles.reviewTitle}>Let's look at these together 🤝</Text>
            <Text style={styles.reviewSubtitle}>
              {sessionWrong.length} equation{sessionWrong.length !== 1 ? 's' : ''} to revisit
            </Text>
            {sessionWrong.map((entry, i) => (
              <View key={i} style={styles.wrongCard}>
                <Text style={styles.wrongEquation}>{entry.equation}</Text>
                <View style={styles.wrongAnswerRow}>
                  <View style={styles.wrongAnswerBox}>
                    <Text style={styles.wrongAnswerLabel}>Your answer</Text>
                    <Text style={[styles.wrongAnswerValue, { color: Colors.danger }]}>
                      {entry.userAnswer || '—'}
                    </Text>
                  </View>
                  <Text style={styles.wrongArrow}>→</Text>
                  <View style={styles.wrongAnswerBox}>
                    <Text style={styles.wrongAnswerLabel}>Correct answer</Text>
                    <Text style={[styles.wrongAnswerValue, { color: Colors.success }]}>
                      {entry.correctAnswer}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
            <TouchableOpacity style={styles.clearBtn} onPress={clearWrongLog}>
              <Text style={styles.clearBtnText}>Clear review list</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.perfectBox}>
            <Text style={styles.perfectEmoji}>🎉</Text>
            <Text style={styles.perfectTitle}>Perfect round!</Text>
            <Text style={styles.perfectSubtitle}>No mistakes this session.</Text>
          </View>
        )}

        {/* Dashboard link */}
        <TouchableOpacity
          style={styles.dashboardBtn}
          onPress={() => router.push('/dashboard')}
        >
          <Text style={styles.dashboardBtnText}>📊 View Full Progress Dashboard</Text>
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
    gap: Spacing.sm,
    paddingVertical: Spacing.xl,
  },
  title: {
    color: Colors.muted,
    fontSize: FontSize.md,
    fontFamily: FontFamily.body,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  score: {
    color: Colors.white,
    fontSize: FontSize.hero,
    fontFamily: FontFamily.heading,
    marginTop: Spacing.sm,
  },
  accuracy: {
    color: Colors.muted,
    fontSize: FontSize.md,
    fontFamily: FontFamily.body,
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
    fontFamily: FontFamily.heading,
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
    fontFamily: FontFamily.headingMedium,
  },
  reviewSection: {
    gap: Spacing.md,
  },
  reviewTitle: {
    color: Colors.white,
    fontSize: FontSize.xl,
    fontFamily: FontFamily.heading,
  },
  reviewSubtitle: {
    color: Colors.muted,
    fontSize: FontSize.sm,
    fontFamily: FontFamily.body,
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
    fontFamily: FontFamily.mono,
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
    fontFamily: FontFamily.body,
  },
  wrongAnswerValue: {
    fontSize: FontSize.lg,
    fontFamily: FontFamily.monoBold,
    marginTop: 2,
  },
  wrongArrow: {
    color: Colors.muted,
    fontSize: FontSize.lg,
    fontFamily: FontFamily.mono,
  },
  clearBtn: {
    alignSelf: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  clearBtnText: {
    color: Colors.muted,
    fontSize: FontSize.sm,
    fontFamily: FontFamily.body,
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
    fontFamily: FontFamily.heading,
  },
  perfectSubtitle: {
    color: Colors.muted,
    fontSize: FontSize.md,
    fontFamily: FontFamily.body,
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
    fontFamily: FontFamily.headingMedium,
  },
});
