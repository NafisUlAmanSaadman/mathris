import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Colors, FontSize, Spacing, Radius } from '../constants/theme';
import type { FallingBrick } from '../engine/bricks';
import { useFontFamily } from '../store/progressStore';

interface Props {
  score: number;
  level: number;
  combo: number;
  isHotStreak: boolean;
  freezeTokens: number;
  hintTokens: number;
  nextBrick: FallingBrick | null;
}

export default function HUD({
  score,
  level,
  combo,
  isHotStreak,
  freezeTokens,
  hintTokens,
  nextBrick,
}: Props) {
  const streakAnim = useRef(new Animated.Value(0)).current;

  const headingMedium = useFontFamily('headingMedium');
  const mono = useFontFamily('mono');
  const monoBold = useFontFamily('monoBold');

  useEffect(() => {
    if (isHotStreak) {
      Animated.spring(streakAnim, { toValue: 1, useNativeDriver: true, tension: 80, friction: 6 }).start();
    } else {
      Animated.timing(streakAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start();
    }
  }, [isHotStreak]);

  const streakScale = streakAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] });

  return (
    <View style={styles.container}>
      {/* Compact stat strip */}
      <View style={styles.strip}>
        <View style={styles.stat}>
          <Text style={[styles.label, { fontFamily: headingMedium }]}>Score</Text>
          <Text style={[styles.value, { fontFamily: monoBold }]}>{score.toLocaleString()}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.stat}>
          <Text style={[styles.label, { fontFamily: headingMedium }]}>Stage</Text>
          <Text style={[styles.value, { fontFamily: monoBold }]}>{level}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.stat}>
          <Text style={[styles.label, { fontFamily: headingMedium }]}>Combo</Text>
          <Text style={[styles.value, combo > 0 && styles.comboActive, { fontFamily: monoBold }]}>
            {combo > 0 ? `×${combo}` : '—'}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.tokenStat}>
          <Text style={[styles.tokenText, { fontFamily: mono }]}>
            {freezeTokens > 0 ? `❄ ${freezeTokens}` : '❄ 0'}
          </Text>
          <Text style={[styles.tokenText, { fontFamily: mono }]}>
            {hintTokens > 0 ? `? ${hintTokens}` : '? 0'}
          </Text>
        </View>
      </View>

      {/* Hot Streak banner — only when active */}
      {isHotStreak && (
        <Animated.View style={[styles.streakBanner, { transform: [{ scale: streakScale }] }]}>
          <Text style={[styles.streakText, { fontFamily: headingMedium }]}>Streak active · ×2 score</Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
    gap: Spacing.xs,
  },
  strip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.bgBorder,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  label: {
    color: Colors.muted,
    fontSize: FontSize.xs,
    letterSpacing: 0.5,
  },
  value: {
    color: Colors.white,
    fontSize: FontSize.lg,
    marginTop: 1,
  },
  comboActive: {
    color: Colors.streak,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: Colors.bgBorder,
  },
  tokenStat: {
    flex: 1,
    alignItems: 'center',
    gap: 1,
  },
  tokenText: {
    color: Colors.muted,
    fontSize: FontSize.xs,
  },
  streakBanner: {
    backgroundColor: Colors.streak,
    borderRadius: Radius.sm,
    paddingVertical: Spacing.xs + 2,
    alignItems: 'center',
  },
  streakText: {
    color: Colors.bg,
    fontSize: FontSize.sm,
    letterSpacing: 0.3,
  },
});
