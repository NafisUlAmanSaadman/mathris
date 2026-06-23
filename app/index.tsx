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
  const [settingsOpen, setSettingsOpen] = useState(false);

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
  const monoBoldFont = useFontFamily('monoBold');

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
        {/* Title / Hero */}
        <View style={styles.hero}>
          <Text style={[styles.title, { fontFamily: headingFont }]}>MATHRIS</Text>
          <View style={styles.titleLine} />
          <Text style={[styles.subtitle, { fontFamily: bodyFont }]}>TETRIS × MATHEMATICS</Text>
        </View>

        {/* Stats Strip */}
        <View style={styles.statsStrip}>
          <Text style={[styles.statsText, { fontFamily: bodyFont }]}>
            Level <Text style={{ fontFamily: monoBoldFont, color: Colors.primary }}>{level}</Text>   ·   
            <Text style={{ fontFamily: monoBoldFont, color: Colors.primary }}>{xp.toLocaleString()}</Text> XP   ·   
            <Text style={{ fontFamily: monoBoldFont, color: Colors.primary }}>{totalGames}</Text> games
          </Text>
        </View>

        {/* Difficulty Segmented Control */}
        <View style={styles.segmentedContainer}>
          {(['easy', 'medium', 'hard'] as Difficulty[]).map(d => {
            const isSelected = selected === d;
            return (
              <TouchableOpacity
                key={d}
                style={[
                  styles.segment,
                  isSelected && styles.segmentActive,
                ]}
                onPress={() => handleSelectDifficulty(d)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.segmentText,
                    { fontFamily: headingMediumFont },
                    isSelected && styles.segmentTextActive,
                  ]}
                >
                  {DIFFICULTY_LABELS[d]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <Text style={[styles.difficultyDescText, { fontFamily: bodyFont }]}>
          {DIFFICULTY_DESC[selected]}
        </Text>

        {/* Play Button */}
        <TouchableOpacity style={styles.playButton} onPress={handlePlay} activeOpacity={0.85}>
          <Text style={[styles.playButtonText, { fontFamily: headingFont }]}>Play</Text>
        </TouchableOpacity>

        {/* Secondary text-link buttons */}
        <View style={styles.secondaryRow}>
          <TouchableOpacity
            onPress={() => {
              triggerImpactHaptic();
              router.push('/dashboard');
            }}
          >
            <Text style={[styles.secondaryLinkText, { fontFamily: headingMediumFont }]}>Dashboard</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              triggerImpactHaptic();
              router.push('/topic-select');
            }}
          >
            <Text style={[styles.secondaryLinkText, { fontFamily: headingMediumFont }]}>Practice</Text>
          </TouchableOpacity>
        </View>

        {/* Settings Toggle Header */}
        <TouchableOpacity
          style={styles.settingsHeader}
          onPress={() => {
            triggerImpactHaptic();
            setSettingsOpen(!settingsOpen);
          }}
          activeOpacity={0.8}
        >
          <Text style={[styles.sectionTitle, { fontFamily: headingMediumFont }]}>
            {settingsOpen ? '▼ Settings' : '▶ Settings'}
          </Text>
        </TouchableOpacity>

        {/* Expandable Settings */}
        {settingsOpen && (
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
                <Text style={[styles.settingName, { fontFamily: headingMediumFont }]}>OpenDyslexic font</Text>
                <Text style={[styles.settingDesc, { fontFamily: bodyFont }]}>Use high-readability typeface</Text>
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
                <Text style={[styles.settingName, { fontFamily: headingMediumFont }]}>Haptic feedback</Text>
                <Text style={[styles.settingDesc, { fontFamily: bodyFont }]}>Vibrate on key clicks and solving</Text>
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
                <Text style={[styles.settingName, { fontFamily: headingMediumFont }]}>Adaptive difficulty</Text>
                <Text style={[styles.settingDesc, { fontFamily: bodyFont }]}>Target equations you struggle with</Text>
              </View>
              <View style={[styles.toggleTrack, adaptiveModeEnabled && styles.toggleTrackActive]}>
                <View style={[styles.toggleThumb, adaptiveModeEnabled && styles.toggleThumbActive]} />
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* How it works */}
        <View style={styles.principlesContainer}>
          <Text style={[styles.principlesText, { fontFamily: bodyFont }]}>
            Solve the equation on each falling brick to lock it.{'\n'}
            Correct answers clear rows and score points.{'\n'}
            Earn freeze and hint power-ups as you level up.
          </Text>
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
    gap: Spacing.xl,
  },
  hero: {
    alignItems: 'center',
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.md,
  },
  title: {
    color: Colors.white,
    fontSize: FontSize.hero,
    letterSpacing: 10,
    textAlign: 'center',
  },
  titleLine: {
    height: 1,
    backgroundColor: Colors.primary,
    width: 80,
    marginVertical: Spacing.md,
    opacity: 0.8,
  },
  subtitle: {
    color: Colors.muted,
    fontSize: FontSize.sm,
    letterSpacing: 3,
    textAlign: 'center',
  },
  statsStrip: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderColor: Colors.bgBorder,
  },
  statsText: {
    color: Colors.white,
    fontSize: FontSize.md,
    letterSpacing: 1,
  },
  segmentedContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    padding: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.bgBorder,
  },
  segment: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderRadius: Radius.sm,
  },
  segmentActive: {
    backgroundColor: Colors.primary,
  },
  segmentText: {
    color: Colors.muted,
    fontSize: FontSize.md,
  },
  segmentTextActive: {
    color: Colors.white,
  },
  difficultyDescText: {
    color: Colors.offWhite,
    fontSize: FontSize.sm,
    textAlign: 'center',
    marginTop: -Spacing.md,
  },
  playButton: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  playButtonText: {
    color: Colors.white,
    fontSize: FontSize.xl,
    letterSpacing: 2,
  },
  secondaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: Spacing.xs,
  },
  secondaryLinkText: {
    color: Colors.primary,
    fontSize: FontSize.md,
    textDecorationLine: 'underline',
  },
  settingsHeader: {
    paddingVertical: Spacing.xs,
  },
  sectionTitle: {
    color: Colors.offWhite,
    fontSize: FontSize.md,
    letterSpacing: 1,
  },
  settingsBox: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.bgBorder,
    gap: Spacing.md,
    marginTop: -Spacing.md,
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
    width: 46,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.bgSurface,
    borderWidth: 1,
    borderColor: Colors.bgBorder,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleTrackActive: {
    backgroundColor: 'rgba(232, 115, 90, 0.2)',
    borderColor: Colors.primary,
  },
  toggleThumb: {
    width: 18,
    height: 18,
    borderRadius: 9,
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
  principlesContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  principlesText: {
    color: Colors.muted,
    fontSize: FontSize.sm,
    lineHeight: 22,
    textAlign: 'center',
  },
});
