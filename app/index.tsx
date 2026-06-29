import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Switch,
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

      {/* Scattered background math symbols */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Text style={[styles.bgSymbol, { top: '10%', left: '8%', fontSize: 24, fontFamily: monoBoldFont }]}>x² + y²</Text>
        <Text style={[styles.bgSymbol, { top: '18%', right: '12%', fontSize: 28, fontFamily: monoBoldFont }]}>π</Text>
        <Text style={[styles.bgSymbol, { top: '38%', left: '15%', fontSize: 22, fontFamily: monoBoldFont }]}>Σ</Text>
        <Text style={[styles.bgSymbol, { top: '55%', right: '8%', fontSize: 26, fontFamily: monoBoldFont }]}>√π</Text>
        <Text style={[styles.bgSymbol, { top: '78%', left: '10%', fontSize: 24, fontFamily: monoBoldFont }]}>÷</Text>
        <Text style={[styles.bgSymbol, { top: '88%', right: '15%', fontSize: 22, fontFamily: monoBoldFont }]}>+</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Shield Badge Container */}
        <View style={styles.badgeContainer}>
          <View style={styles.badgeBorder}>
            <View style={styles.badgeContent}>
              {/* Floating Tetris Blocks inside the Badge */}
              <View style={styles.floatingBlocks}>
                {/* L Block (orange) */}
                <View style={[styles.block, { backgroundColor: Colors.brickL, top: 12, left: 30 }]}>
                  <Text style={[styles.blockText, { fontFamily: monoBoldFont }]}>3+2</Text>
                </View>
                
                {/* J Block (blue) */}
                <View style={[styles.block, { backgroundColor: Colors.brickJ, top: 48, left: 105 }]}>
                  <Text style={[styles.blockText, { fontFamily: monoBoldFont }]}>5×4</Text>
                </View>

                {/* S Block (green) */}
                <View style={[styles.block, { backgroundColor: Colors.brickS, top: 22, left: 180 }]}>
                  <Text style={[styles.blockText, { fontFamily: monoBoldFont }]}>10-6</Text>
                </View>
              </View>

              {/* Colorful Title "MATHRIS" */}
              <View style={styles.titleContainer}>
                {[
                  { char: 'M', color: '#F09A37' },
                  { char: 'A', color: '#37C4D8' },
                  { char: 'T', color: '#6BBF8A' },
                  { char: 'H', color: '#E8735A' },
                  { char: 'R', color: '#E8A94B' },
                  { char: 'I', color: '#5B8FD9' },
                  { char: 'S', color: '#B07CD8' },
                ].map((item, idx) => (
                  <Text
                    key={idx}
                    style={[
                      styles.titleChar,
                      { color: item.color, fontFamily: headingFont },
                    ]}
                  >
                    {item.char}
                  </Text>
                ))}
              </View>

              {/* Tagline Banner */}
              <View style={styles.taglineBanner}>
                <Text style={[styles.taglineText, { fontFamily: headingMediumFont }]}>
                  PLAY. SOLVE. BLOCK!
                </Text>
              </View>
            </View>
          </View>
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
            <View style={styles.settingRow}>
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingName, { fontFamily: headingMediumFont }]}>OpenDyslexic font</Text>
                <Text style={[styles.settingDesc, { fontFamily: bodyFont }]}>Use high-readability typeface</Text>
              </View>
              <Switch
                value={dyslexiaFontEnabled}
                onValueChange={() => {
                  triggerImpactHaptic();
                  toggleDyslexiaFont();
                }}
                trackColor={{ false: Colors.bgSurface, true: 'rgba(232, 115, 90, 0.4)' }}
                thumbColor={dyslexiaFontEnabled ? Colors.primary : Colors.muted}
              />
            </View>

            <View style={styles.divider} />

            {/* Haptics Toggle */}
            <View style={styles.settingRow}>
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingName, { fontFamily: headingMediumFont }]}>Haptic feedback</Text>
                <Text style={[styles.settingDesc, { fontFamily: bodyFont }]}>Vibrate on key clicks and solving</Text>
              </View>
              <Switch
                value={hapticsEnabled}
                onValueChange={() => {
                  triggerImpactHaptic();
                  toggleHaptics();
                }}
                trackColor={{ false: Colors.bgSurface, true: 'rgba(232, 115, 90, 0.4)' }}
                thumbColor={hapticsEnabled ? Colors.primary : Colors.muted}
              />
            </View>

            <View style={styles.divider} />

            {/* Adaptive ML Mode Toggle */}
            <View style={styles.settingRow}>
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingName, { fontFamily: headingMediumFont }]}>Adaptive difficulty</Text>
                <Text style={[styles.settingDesc, { fontFamily: bodyFont }]}>Target equations you struggle with</Text>
              </View>
              <Switch
                value={adaptiveModeEnabled}
                onValueChange={() => {
                  triggerImpactHaptic();
                  toggleAdaptiveMode();
                }}
                trackColor={{ false: Colors.bgSurface, true: 'rgba(232, 115, 90, 0.4)' }}
                thumbColor={adaptiveModeEnabled ? Colors.primary : Colors.muted}
              />
            </View>
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
  bgSymbol: {
    position: 'absolute',
    color: Colors.bgBorder,
    opacity: 0.15,
  },
  badgeContainer: {
    alignItems: 'center',
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  badgeBorder: {
    borderWidth: 3,
    borderColor: '#37C4D8', // Bright retro cyan border
    borderRadius: Radius.xl,
    padding: 6,
    // Soft cyan glow
    shadowColor: '#37C4D8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 8,
  },
  badgeContent: {
    backgroundColor: '#1E2433', // Graphite/Card background
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.xl,
    paddingTop: 100, // Make room for floating blocks
    paddingBottom: Spacing.xl,
    alignItems: 'center',
    width: 280,
    height: 250,
    justifyContent: 'flex-end',
    position: 'relative',
    overflow: 'hidden',
  },
  floatingBlocks: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  block: {
    position: 'absolute',
    width: 60,
    height: 30,
    borderRadius: Radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(232, 228, 220, 0.3)',
    // Soft drop shadow on blocks
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 4,
  },
  blockText: {
    color: Colors.white,
    fontSize: FontSize.xs,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  titleChar: {
    fontSize: 34,
    letterSpacing: 2,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
  },
  taglineBanner: {
    backgroundColor: Colors.bg,
    borderRadius: Radius.full,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: '#37C4D8',
  },
  taglineText: {
    color: Colors.white,
    fontSize: 10,
    letterSpacing: 1.5,
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
