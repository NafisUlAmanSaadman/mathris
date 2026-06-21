import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Colors, FontFamily, FontSize, Spacing, Radius } from '../constants/theme';
import type { FallingBrick } from '../engine/bricks';

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

  useEffect(() => {
    if (isHotStreak) {
      Animated.spring(streakAnim, { toValue: 1, useNativeDriver: true, tension: 80, friction: 6 }).start();
    } else {
      Animated.timing(streakAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start();
    }
  }, [isHotStreak]);

  const streakScale = streakAnim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] });

  return (
    <View style={styles.container}>
      {/* Top row — score & level */}
      <View style={styles.topRow}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>SCORE</Text>
          <Text style={styles.statValue}>{score.toLocaleString()}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>LEVEL</Text>
          <Text style={styles.statValue}>{level}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>COMBO</Text>
          <Text style={[styles.statValue, combo > 0 && styles.comboActive]}>
            {combo > 0 ? `×${combo}` : '—'}
          </Text>
        </View>
      </View>

      {/* Hot Streak banner */}
      {isHotStreak && (
        <Animated.View style={[styles.streakBanner, { transform: [{ scale: streakScale }] }]}>
          <Text style={styles.streakText}>🔥 HOT STREAK! ×2 SCORE</Text>
        </Animated.View>
      )}

      {/* Tokens */}
      <View style={styles.tokensRow}>
        <View style={styles.tokenGroup}>
          {Array.from({ length: 3 }).map((_, i) => (
            <Text key={i} style={[styles.tokenIcon, i < freezeTokens ? styles.tokenActive : styles.tokenUsed]}>
              🧊
            </Text>
          ))}
          <Text style={styles.tokenLabel}>Freeze</Text>
        </View>
        <View style={styles.tokenGroup}>
          {Array.from({ length: 3 }).map((_, i) => (
            <Text key={i} style={[styles.tokenIcon, i < hintTokens ? styles.tokenActive : styles.tokenUsed]}>
              💡
            </Text>
          ))}
          <Text style={styles.tokenLabel}>Hints</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  topRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  statBox: {
    flex: 1,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.bgBorder,
  },
  statLabel: {
    color: Colors.muted,
    fontSize: FontSize.xs,
    fontFamily: FontFamily.body,
    letterSpacing: 1,
  },
  statValue: {
    color: Colors.white,
    fontSize: FontSize.lg,
    fontFamily: FontFamily.heading,
    marginTop: 2,
  },
  comboActive: {
    color: Colors.streak,
  },
  streakBanner: {
    backgroundColor: Colors.streak,
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  streakText: {
    color: Colors.white,
    fontSize: FontSize.md,
    fontFamily: FontFamily.heading,
    letterSpacing: 0.5,
  },
  tokensRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    justifyContent: 'center',
  },
  tokenGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  tokenIcon: {
    fontSize: 18,
  },
  tokenActive: {
    opacity: 1,
  },
  tokenUsed: {
    opacity: 0.25,
  },
  tokenLabel: {
    color: Colors.muted,
    fontSize: FontSize.xs,
    fontFamily: FontFamily.body,
    marginLeft: Spacing.xs,
  },
});
