import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useGameStore } from '../store/gameStore';
import { useProgressStore } from '../store/progressStore';
import { Colors, FontFamily, FontSize, Spacing, Radius } from '../constants/theme';
import type { Difficulty } from '../constants/config';
import { DIFFICULTY_LABELS } from '../constants/config';

const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  easy: Colors.easy,
  medium: Colors.medium,
  hard: Colors.hard,
};

const DIFFICULTY_ICONS: Record<Difficulty, string> = {
  easy: '🟢',
  medium: '🟡',
  hard: '🔴',
};

const DIFFICULTY_DESC: Record<Difficulty, string> = {
  easy: 'Arithmetic: + − × ÷',
  medium: 'Algebra: Solve for X',
  hard: 'Systems: Find X and Y',
};

export default function MenuScreen() {
  const router = useRouter();
  const setDifficulty = useGameStore(s => s.setDifficulty);
  const resetGame = useGameStore(s => s.resetGame);
  const [selected, setSelected] = useState<Difficulty>('easy');
  const { xp, level, totalGames } = useProgressStore();

  const handlePlay = () => {
    resetGame();
    setDifficulty(selected);
    router.push('/game');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.logo}>🧱</Text>
          <Text style={styles.title}>MATHRIS</Text>
          <Text style={styles.subtitle}>Tetris × Mathematics</Text>
        </View>

        {/* Player stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>Lv. {level}</Text>
            <Text style={styles.statLabel}>Level</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{xp.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Total XP</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalGames}</Text>
            <Text style={styles.statLabel}>Games</Text>
          </View>
        </View>

        {/* Difficulty selector */}
        <Text style={styles.sectionTitle}>Choose Difficulty</Text>
        <View style={styles.difficultyGroup}>
          {(['easy', 'medium', 'hard'] as Difficulty[]).map(d => (
            <TouchableOpacity
              key={d}
              style={[
                styles.difficultyCard,
                selected === d && { borderColor: DIFFICULTY_COLORS[d], borderWidth: 2 },
              ]}
              onPress={() => setSelected(d)}
              activeOpacity={0.8}
            >
              <Text style={styles.difficultyIcon}>{DIFFICULTY_ICONS[d]}</Text>
              <View style={styles.difficultyText}>
                <Text style={[styles.difficultyName, { color: DIFFICULTY_COLORS[d] }]}>
                  {DIFFICULTY_LABELS[d]}
                </Text>
                <Text style={styles.difficultyDesc}>{DIFFICULTY_DESC[d]}</Text>
              </View>
              {selected === d && (
                <Text style={[styles.checkmark, { color: DIFFICULTY_COLORS[d] }]}>✓</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Play button */}
        <TouchableOpacity style={styles.playButton} onPress={handlePlay} activeOpacity={0.85}>
          <Text style={styles.playButtonText}>▶  Play Mathris</Text>
        </TouchableOpacity>

        {/* Secondary buttons */}
        <View style={styles.secondaryRow}>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => router.push('/dashboard')}
          >
            <Text style={styles.secondaryBtnText}>📊 Dashboard</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => router.push('/topic-select')}
          >
            <Text style={styles.secondaryBtnText}>🎯 Practice</Text>
          </TouchableOpacity>
        </View>

        {/* Design principles */}
        <View style={styles.principlesBox}>
          <Text style={styles.principlesTitle}>How it works</Text>
          <Text style={styles.principleItem}>🧱  Solve the equation on each falling brick</Text>
          <Text style={styles.principleItem}>✓  Correct → brick locks & rows clear</Text>
          <Text style={styles.principleItem}>✗  Wrong → brick speeds up (1 retry)</Text>
          <Text style={styles.principleItem}>🧊  Freeze tokens pause a brick for 10s</Text>
          <Text style={styles.principleItem}>💡  Hint tokens show step-by-step solutions</Text>
          <Text style={styles.principleItem}>🔥  3+ correct in a row = Hot Streak ×2</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  container: {
    padding: Spacing.xl,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.lg,
  },
  hero: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  logo: { fontSize: 64 },
  title: {
    color: Colors.white,
    fontSize: FontSize.hero,
    fontFamily: FontFamily.heading,
    letterSpacing: 8,
    marginTop: Spacing.sm,
  },
  subtitle: {
    color: Colors.muted,
    fontSize: FontSize.md,
    fontFamily: FontFamily.body,
    marginTop: Spacing.xs,
    letterSpacing: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.bgBorder,
  },
  statValue: {
    color: Colors.white,
    fontSize: FontSize.lg,
    fontFamily: FontFamily.heading,
  },
  statLabel: {
    color: Colors.muted,
    fontSize: FontSize.xs,
    fontFamily: FontFamily.body,
    marginTop: 2,
  },
  sectionTitle: {
    color: Colors.offWhite,
    fontSize: FontSize.md,
    fontFamily: FontFamily.headingMedium,
    letterSpacing: 1,
  },
  difficultyGroup: { gap: Spacing.sm },
  difficultyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.bgBorder,
    gap: Spacing.md,
  },
  difficultyIcon: { fontSize: 28 },
  difficultyText: { flex: 1 },
  difficultyName: {
    fontSize: FontSize.lg,
    fontFamily: FontFamily.heading,
  },
  difficultyDesc: {
    color: Colors.muted,
    fontSize: FontSize.sm,
    fontFamily: FontFamily.body,
    marginTop: 2,
  },
  checkmark: {
    fontSize: FontSize.xl,
    fontFamily: FontFamily.heading,
  },
  playButton: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  playButtonText: {
    color: Colors.white,
    fontSize: FontSize.xl,
    fontFamily: FontFamily.heading,
    letterSpacing: 1,
  },
  secondaryRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  secondaryBtn: {
    flex: 1,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.bgBorder,
  },
  secondaryBtnText: {
    color: Colors.offWhite,
    fontSize: FontSize.md,
    fontFamily: FontFamily.headingMedium,
  },
  principlesBox: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.bgBorder,
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  principlesTitle: {
    color: Colors.white,
    fontSize: FontSize.md,
    fontFamily: FontFamily.heading,
    marginBottom: Spacing.xs,
  },
  principleItem: {
    color: Colors.muted,
    fontSize: FontSize.sm,
    fontFamily: FontFamily.body,
    lineHeight: 20,
  },
});
