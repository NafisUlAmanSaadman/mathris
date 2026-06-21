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
import { useProgressStore, useFontFamily } from '../store/progressStore';
import { Colors, FontSize, Spacing, Radius } from '../constants/theme';
import type { Difficulty } from '../constants/config';
import { DIFFICULTY_LABELS } from '../constants/config';
import MenuSkiaRain from '../components/MenuSkiaRain';
import { triggerImpactHaptic } from '../utils/haptics';

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

  // Progress store state & settings
  const {
    xp,
    level,
    totalGames,
    dyslexiaFontEnabled,
    adaptiveModeEnabled,
    hapticsEnabled,
    toggleDyslexiaFont,
    toggleAdaptiveMode,
    toggleHaptics,
  } = useProgressStore();

  // Dynamic Typography
  const headingFont = useFontFamily('heading');
  const headingMediumFont = useFontFamily('headingMedium');
  const bodyFont = useFontFamily('body');

  const handlePlay = () => {
    triggerImpactHaptic();
    resetGame();
    setDifficulty(selected);
    router.push('/game');
  };

  const handleSelectDifficulty = (d: Difficulty) => {
    triggerImpactHaptic();
    setSelected(d);
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* 60fps Skia Rain in background */}
      <MenuSkiaRain />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.logo}>🧱</Text>
          <Text style={[styles.title, { fontFamily: headingFont }]}>MATHRIS</Text>
          <Text style={[styles.subtitle, { fontFamily: bodyFont }]}>Tetris × Mathematics</Text>
        </View>

        {/* Player stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { fontFamily: headingFont }]}>Lv. {level}</Text>
            <Text style={[styles.statLabel, { fontFamily: bodyFont }]}>Level</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { fontFamily: headingFont }]}>{xp.toLocaleString()}</Text>
            <Text style={[styles.statLabel, { fontFamily: bodyFont }]}>Total XP</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { fontFamily: headingFont }]}>{totalGames}</Text>
            <Text style={[styles.statLabel, { fontFamily: bodyFont }]}>Games</Text>
          </View>
        </View>

        {/* Difficulty selector */}
        <Text style={[styles.sectionTitle, { fontFamily: headingMediumFont }]}>Choose Difficulty</Text>
        <View style={styles.difficultyGroup}>
          {(['easy', 'medium', 'hard'] as Difficulty[]).map(d => (
            <TouchableOpacity
              key={d}
              style={[
                styles.difficultyCard,
                selected === d && { borderColor: DIFFICULTY_COLORS[d], borderWidth: 2 },
              ]}
              onPress={() => handleSelectDifficulty(d)}
              activeOpacity={0.8}
            >
              <Text style={styles.difficultyIcon}>{DIFFICULTY_ICONS[d]}</Text>
              <View style={styles.difficultyText}>
                <Text style={[styles.difficultyName, { color: DIFFICULTY_COLORS[d], fontFamily: headingFont }]}>
                  {DIFFICULTY_LABELS[d]}
                </Text>
                <Text style={[styles.difficultyDesc, { fontFamily: bodyFont }]}>{DIFFICULTY_DESC[d]}</Text>
              </View>
              {selected === d && (
                <Text style={[styles.checkmark, { color: DIFFICULTY_COLORS[d], fontFamily: headingFont }]}>✓</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Play button */}
        <TouchableOpacity style={styles.playButton} onPress={handlePlay} activeOpacity={0.85}>
          <Text style={[styles.playButtonText, { fontFamily: headingFont }]}>▶  Play Mathris</Text>
        </TouchableOpacity>

        {/* Secondary buttons */}
        <View style={styles.secondaryRow}>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => {
              triggerImpactHaptic();
              router.push('/dashboard');
            }}
          >
            <Text style={[styles.secondaryBtnText, { fontFamily: headingMediumFont }]}>📊 Dashboard</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => {
              triggerImpactHaptic();
              router.push('/topic-select');
            }}
          >
            <Text style={[styles.secondaryBtnText, { fontFamily: headingMediumFont }]}>🎯 Practice</Text>
          </TouchableOpacity>
        </View>

        {/* Accessibility & Settings Panel */}
        <Text style={[styles.sectionTitle, { fontFamily: headingMediumFont }]}>Settings & Accessibility</Text>
        <View style={styles.settingsBox}>
          {/* Dyslexia Font Toggle */}
          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => {
              triggerImpactHaptic();
              toggleDyslexiaFont();
            }}
            activeOpacity={0.8}
          >
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingName, { fontFamily: headingMediumFont }]}>Dyslexia-friendly Font</Text>
              <Text style={[styles.settingDesc, { fontFamily: bodyFont }]}>Use high-readability OpenDyslexic typeface</Text>
            </View>
            <View style={[styles.toggleTrack, dyslexiaFontEnabled && styles.toggleTrackActive]}>
              <View style={[styles.toggleThumb, dyslexiaFontEnabled && styles.toggleThumbActive]} />
            </View>
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Haptics Toggle */}
          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => {
              triggerImpactHaptic();
              toggleHaptics();
            }}
            activeOpacity={0.8}
          >
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingName, { fontFamily: headingMediumFont }]}>Haptic Feedback</Text>
              <Text style={[styles.settingDesc, { fontFamily: bodyFont }]}>Vibrate on key clicks and solving equations</Text>
            </View>
            <View style={[styles.toggleTrack, hapticsEnabled && styles.toggleTrackActive]}>
              <View style={[styles.toggleThumb, hapticsEnabled && styles.toggleThumbActive]} />
            </View>
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Adaptive ML Mode Toggle */}
          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => {
              triggerImpactHaptic();
              toggleAdaptiveMode();
            }}
            activeOpacity={0.8}
          >
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingName, { fontFamily: headingMediumFont }]}>Target Weak Areas (Adaptive)</Text>
              <Text style={[styles.settingDesc, { fontFamily: bodyFont }]}>Spawn equations you struggle with more frequently</Text>
            </View>
            <View style={[styles.toggleTrack, adaptiveModeEnabled && styles.toggleTrackActive]}>
              <View style={[styles.toggleThumb, adaptiveModeEnabled && styles.toggleThumbActive]} />
            </View>
          </TouchableOpacity>
        </View>

        {/* How it works */}
        <View style={styles.principlesBox}>
          <Text style={[styles.principlesTitle, { fontFamily: headingFont }]}>How it works</Text>
          <Text style={[styles.principleItem, { fontFamily: bodyFont }]}>🧱  Solve the equation on each falling brick</Text>
          <Text style={[styles.principleItem, { fontFamily: bodyFont }]}>✓  Correct → brick locks & rows clear</Text>
          <Text style={[styles.principleItem, { fontFamily: bodyFont }]}>✗  Wrong → brick speeds up (1 retry)</Text>
          <Text style={[styles.principleItem, { fontFamily: bodyFont }]}>🧊  Freeze tokens pause a brick for 10s</Text>
          <Text style={[styles.principleItem, { fontFamily: bodyFont }]}>💡  Hint tokens show step-by-step solutions</Text>
          <Text style={[styles.principleItem, { fontFamily: bodyFont }]}>🔥  3+ correct in a row = Hot Streak ×2</Text>
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
    paddingVertical: Spacing.xl,
  },
  logo: { fontSize: 64 },
  title: {
    color: Colors.white,
    fontSize: FontSize.hero,
    letterSpacing: 8,
    marginTop: Spacing.xs,
  },
  subtitle: {
    color: Colors.muted,
    fontSize: FontSize.md,
    marginTop: Spacing.xs,
    letterSpacing: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(19, 19, 43, 0.75)', // semi-transparent to let Skia show
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.bgBorder,
  },
  statValue: {
    color: Colors.white,
    fontSize: FontSize.lg,
  },
  statLabel: {
    color: Colors.muted,
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  sectionTitle: {
    color: Colors.offWhite,
    fontSize: FontSize.md,
    letterSpacing: 1,
    marginTop: Spacing.xs,
  },
  difficultyGroup: { gap: Spacing.sm },
  difficultyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(19, 19, 43, 0.75)',
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
  },
  difficultyDesc: {
    color: Colors.muted,
    fontSize: FontSize.sm,
    marginTop: 2,
  },
  checkmark: {
    fontSize: FontSize.xl,
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
    letterSpacing: 1,
  },
  secondaryRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  secondaryBtn: {
    flex: 1,
    backgroundColor: 'rgba(19, 19, 43, 0.75)',
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.bgBorder,
  },
  secondaryBtnText: {
    color: Colors.offWhite,
    fontSize: FontSize.md,
  },
  // Settings Panel Styles
  settingsBox: {
    backgroundColor: 'rgba(19, 19, 43, 0.85)',
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.bgBorder,
    gap: Spacing.md,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingName: {
    color: Colors.white,
    fontSize: FontSize.md,
  },
  settingDesc: {
    color: Colors.muted,
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  toggleTrack: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.bgSurface,
    borderWidth: 1,
    borderColor: Colors.bgBorder,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleTrackActive: {
    backgroundColor: 'rgba(108, 99, 255, 0.3)',
    borderColor: Colors.primary,
  },
  toggleThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.muted,
  },
  toggleThumbActive: {
    backgroundColor: Colors.primary,
    alignSelf: 'flex-end',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.bgBorder,
  },
  principlesBox: {
    backgroundColor: 'rgba(19, 19, 43, 0.75)',
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
    marginBottom: Spacing.xs,
  },
  principleItem: {
    color: Colors.muted,
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
});
