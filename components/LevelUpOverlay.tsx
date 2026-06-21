import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import { Colors, FontSize, Spacing, Radius, Shadow } from '../constants/theme';
import { triggerSuccessHaptic } from '../utils/haptics';
import { useFontFamily } from '../store/progressStore';

interface Props {
  newLevel: number;
  onClose: () => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Generate some random confetti particles
const PARTICLE_COUNT = 24;
const PARTICLES = Array.from({ length: PARTICLE_COUNT }, (_, i) => {
  const angle = (i / PARTICLE_COUNT) * 2 * Math.PI;
  return {
    id: i,
    color: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#6C63FF', '#C77DFF', '#4ADE80'][i % 6],
    size: Math.random() * 8 + 6,
    // Random direction vectors
    dx: Math.cos(angle) * (Math.random() * 120 + 80),
    dy: Math.sin(angle) * (Math.random() * 120 + 80) - 30, // drift up slightly
  };
});

export default function LevelUpOverlay({ newLevel, onClose }: Props) {
  const headingFont = useFontFamily('heading');
  const bodyFont = useFontFamily('body');
  const monoBoldFont = useFontFamily('monoBold');

  // Animation values
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const rotation = useSharedValue(0);
  const pulse = useSharedValue(1);
  const particlesProgress = useSharedValue(0);

  useEffect(() => {
    // Play level up sound/haptics
    triggerSuccessHaptic();

    // Trigger animations
    opacity.value = withTiming(1, { duration: 300 });
    scale.value = withSpring(1, { damping: 10, stiffness: 80 });

    rotation.value = withRepeat(
      withTiming(360, { duration: 8000, easing: Easing.linear }),
      -1,
      false
    );

    pulse.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 600, easing: Easing.ease }),
        withTiming(1.0, { duration: 600, easing: Easing.ease })
      ),
      -1,
      true
    );

    particlesProgress.value = withSpring(1, { damping: 12, stiffness: 45 });

    return () => {
      cancelAnimation(opacity);
      cancelAnimation(scale);
      cancelAnimation(rotation);
      cancelAnimation(pulse);
      cancelAnimation(particlesProgress);
    };
  }, []);

  const bgStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const btnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  return (
    <Animated.View style={[styles.container, bgStyle]}>
      {/* Background Glow */}
      <Animated.View style={[styles.glowRing, glowStyle, Shadow.glow(Colors.primary)]} />

      {/* Confetti Particles */}
      {PARTICLES.map(p => {
        const particleStyle = useAnimatedStyle(() => {
          const x = p.dx * particlesProgress.value;
          const y = p.dy * particlesProgress.value;
          const op = 1 - particlesProgress.value;
          const rot = particlesProgress.value * 720;
          return {
            transform: [
              { translateX: x },
              { translateY: y },
              { rotate: `${rot}deg` },
            ],
            opacity: op,
          };
        });

        return (
          <Animated.View
            key={p.id}
            style={[
              styles.particle,
              particleStyle,
              {
                backgroundColor: p.color,
                width: p.size,
                height: p.size,
                borderRadius: p.size / 2,
              },
            ]}
          />
        );
      })}

      {/* Main Alert Card */}
      <Animated.View style={[styles.card, cardStyle]}>
        <Text style={[styles.emoji, { textShadowColor: Colors.primary, textShadowRadius: 20 }]}>🏆</Text>
        <Text style={[styles.title, { fontFamily: headingFont }]}>LEVEL UP!</Text>
        <Text style={[styles.subtitle, { fontFamily: bodyFont }]}>Your math skills are ascending</Text>

        <View style={styles.badgeContainer}>
          <View style={styles.levelBadge}>
            <Text style={[styles.levelLabel, { fontFamily: bodyFont }]}>NEW LEVEL</Text>
            <Text style={[styles.levelValue, { fontFamily: monoBoldFont }]}>{newLevel}</Text>
          </View>
        </View>

        <Animated.View style={btnStyle}>
          <TouchableOpacity style={styles.button} onPress={onClose} activeOpacity={0.8}>
            <Text style={[styles.buttonText, { fontFamily: headingFont }]}>CONTINUE</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(5, 5, 15, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  glowRing: {
    position: 'absolute',
    width: SCREEN_WIDTH * 0.8,
    height: SCREEN_WIDTH * 0.8,
    borderRadius: (SCREEN_WIDTH * 0.8) / 2,
    borderWidth: 4,
    borderColor: 'rgba(108, 99, 255, 0.15)',
    borderStyle: 'dashed',
  },
  card: {
    width: SCREEN_WIDTH * 0.85,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl,
    borderWidth: 1.5,
    borderColor: Colors.bgBorder,
    padding: Spacing.xxl,
    alignItems: 'center',
    ...Shadow.glow(Colors.primaryDark),
  },
  emoji: {
    fontSize: 72,
    marginBottom: Spacing.sm,
    textShadowOffset: { width: 0, height: 0 },
  },
  title: {
    color: Colors.white,
    fontSize: FontSize.display,
    letterSpacing: 2,
    textAlign: 'center',
  },
  subtitle: {
    color: Colors.muted,
    fontSize: FontSize.md,
    textAlign: 'center',
    marginTop: Spacing.xs,
    marginBottom: Spacing.xl,
  },
  badgeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xxl,
  },
  levelBadge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.bgSurface,
    borderWidth: 3,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.glow(Colors.primaryLight),
  },
  levelLabel: {
    color: Colors.muted,
    fontSize: 10,
    letterSpacing: 1,
  },
  levelValue: {
    color: Colors.white,
    fontSize: FontSize.display,
    marginTop: -2,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.md,
    ...Shadow.glow(Colors.primary),
  },
  buttonText: {
    color: Colors.white,
    fontSize: FontSize.lg,
    letterSpacing: 1,
  },
  particle: {
    position: 'absolute',
    zIndex: 10,
  },
});
