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
  type SharedValue,
} from 'react-native-reanimated';
import { Colors, FontSize, Spacing, Radius, Shadow } from '../constants/theme';
import { triggerSuccessHaptic } from '../utils/haptics';
import { useFontFamily } from '../store/progressStore';

interface Props {
  newLevel: number;
  onClose: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const PARTICLE_COUNT = 20;
const PARTICLE_COLORS = [
  Colors.primary,
  Colors.success,
  Colors.streak,
  Colors.brickT,
  Colors.brickJ,
  Colors.brickS,
];
const PARTICLES = Array.from({ length: PARTICLE_COUNT }, (_, i) => {
  const angle = (i / PARTICLE_COUNT) * 2 * Math.PI;
  return {
    id: i,
    color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
    size: Math.random() * 7 + 5,
    dx: Math.cos(angle) * (Math.random() * 100 + 60),
    dy: Math.sin(angle) * (Math.random() * 100 + 60) - 20,
  };
});

function Particle({ p, particlesProgress }: { p: typeof PARTICLES[number]; particlesProgress: SharedValue<number> }) {
  const particleStyle = useAnimatedStyle(() => {
    const x = p.dx * particlesProgress.value;
    const y = p.dy * particlesProgress.value;
    const op = 1 - particlesProgress.value;
    const rot = particlesProgress.value * 540;
    return {
      transform: [{ translateX: x }, { translateY: y }, { rotate: `${rot}deg` }],
      opacity: op,
    };
  });

  return (
    <Animated.View
      style={[styles.particle, particleStyle, { backgroundColor: p.color, width: p.size, height: p.size, borderRadius: 2 }]}
    />
  );
}

export default function LevelUpOverlay({ newLevel, onClose }: Props) {
  const headingFont = useFontFamily('heading');
  const bodyFont = useFontFamily('body');
  const monoBoldFont = useFontFamily('monoBold');

  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const pulse = useSharedValue(1);
  const particlesProgress = useSharedValue(0);

  useEffect(() => {
    triggerSuccessHaptic();

    opacity.value = withTiming(1, { duration: 300 });
    scale.value = withSpring(1, { damping: 12, stiffness: 90 });

    pulse.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 700, easing: Easing.ease }),
        withTiming(1.0, { duration: 700, easing: Easing.ease })
      ),
      -1,
      true
    );

    particlesProgress.value = withSpring(1, { damping: 14, stiffness: 50 });

    return () => {
      cancelAnimation(opacity);
      cancelAnimation(scale);
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

  const btnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  return (
    <Animated.View style={[styles.container, bgStyle]}>
      {/* Confetti */}
      {PARTICLES.map(p => (
        <Particle key={p.id} p={p} particlesProgress={particlesProgress} />
      ))}

      {/* Card */}
      <Animated.View style={[styles.card, cardStyle]}>
        <Text style={[styles.title, { fontFamily: headingFont }]}>STAGE UP</Text>
        <Text style={[styles.subtitle, { fontFamily: bodyFont }]}>Keep going</Text>

        <View style={styles.badgeContainer}>
          <View style={styles.levelBadge}>
            <Text style={[styles.levelLabel, { fontFamily: bodyFont }]}>STAGE</Text>
            <Text style={[styles.levelValue, { fontFamily: monoBoldFont }]}>{newLevel}</Text>
          </View>
        </View>

        <Animated.View style={btnStyle}>
          <TouchableOpacity style={styles.button} onPress={onClose} activeOpacity={0.8}>
            <Text style={[styles.buttonText, { fontFamily: headingFont }]}>Continue</Text>
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
    backgroundColor: 'rgba(10, 12, 20, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  card: {
    width: SCREEN_WIDTH * 0.82,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.bgBorder,
    padding: Spacing.xxl,
    alignItems: 'center',
  },
  title: {
    color: Colors.white,
    fontSize: FontSize.display,
    letterSpacing: 3,
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
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.bgSurface,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.glow(Colors.primary),
  },
  levelLabel: {
    color: Colors.muted,
    fontSize: 9,
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
  },
  buttonText: {
    color: Colors.white,
    fontSize: FontSize.lg,
    letterSpacing: 0.5,
  },
  particle: {
    position: 'absolute',
    zIndex: 10,
  },
});
