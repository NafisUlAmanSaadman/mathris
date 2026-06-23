import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useGameStore } from '../store/gameStore';
import { useFontFamily } from '../store/progressStore';
import { Colors, FontSize, Spacing, Radius } from '../constants/theme';
import type { EquationTopic } from '../engine/equations';
import type { Difficulty } from '../constants/config';
import { triggerImpactHaptic } from '../utils/haptics';

interface TopicOption {
  topic: EquationTopic;
  label: string;
  difficulty: Difficulty;
  icon: string;
}

const TOPICS: TopicOption[] = [
  { topic: 'addition', label: 'Addition', difficulty: 'easy', icon: '+' },
  { topic: 'subtraction', label: 'Subtraction', difficulty: 'easy', icon: '−' },
  { topic: 'multiplication', label: 'Multiplication', difficulty: 'easy', icon: '×' },
  { topic: 'division', label: 'Division', difficulty: 'easy', icon: '÷' },
  { topic: 'algebra-one-step', label: 'One-Step Algebra', difficulty: 'medium', icon: 'x' },
  { topic: 'algebra-two-step', label: 'Two-Step Algebra', difficulty: 'medium', icon: '2x' },
  { topic: 'algebra-rational', label: 'Rational Equations', difficulty: 'medium', icon: 'x/y' },
  { topic: 'systems-integer', label: 'Systems of Equations', difficulty: 'hard', icon: 'x,y' },
];

const DIFF_COLORS: Record<Difficulty, string> = {
  easy: Colors.easy,
  medium: Colors.medium,
  hard: Colors.hard,
};

export default function TopicSelectScreen() {
  const router = useRouter();
  const { setDifficulty, resetGame, setPracticeTopic } = useGameStore();
  const [selected, setSelected] = useState<TopicOption | null>(null);

  // Typography for dyslexia accessibility
  const headingFont = useFontFamily('heading');
  const headingMediumFont = useFontFamily('headingMedium');
  const bodyFont = useFontFamily('body');
  const monoBoldFont = useFontFamily('monoBold');

  const handleStart = () => {
    if (!selected) return;
    triggerImpactHaptic();
    resetGame();
    setDifficulty(selected.difficulty);
    setPracticeTopic(selected.topic);
    router.push('/game');
  };

  const handleSelect = (opt: TopicOption) => {
    triggerImpactHaptic();
    setSelected(opt);
  };

  const handleBack = () => {
    triggerImpactHaptic();
    router.back();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { fontFamily: headingFont }]}>Practice Mode</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={[styles.desc, { fontFamily: bodyFont }]}>
          Pick a topic to drill. Only equations from that topic will fall — perfect for targeting weak spots.
        </Text>

        <View style={styles.topicsGrid}>
          {TOPICS.map(opt => {
            const isSelected = selected?.topic === opt.topic;
            return (
              <TouchableOpacity
                key={opt.topic}
                style={[
                  styles.topicCard,
                  isSelected && styles.topicCardSelected,
                ]}
                onPress={() => handleSelect(opt)}
                activeOpacity={0.8}
              >
                <View style={styles.iconContainer}>
                  <Text style={[styles.topicIcon, { fontFamily: monoBoldFont, color: isSelected ? Colors.primary : Colors.muted }]}>
                    {opt.icon}
                  </Text>
                </View>
                <Text style={[styles.topicLabel, { fontFamily: headingMediumFont }]}>{opt.label}</Text>
                <Text style={[styles.topicDiff, { color: DIFF_COLORS[opt.difficulty], fontFamily: bodyFont }]}>
                  {opt.difficulty}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={[styles.startBtn, !selected && styles.startBtnDisabled]}
          onPress={handleStart}
          disabled={!selected}
        >
          <Text style={[styles.startBtnText, { fontFamily: headingFont }]}>
            {selected ? `Practice ${selected.label}` : 'Select a topic'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.bgBorder,
  },
  backBtnText: {
    color: Colors.offWhite,
    fontSize: FontSize.lg,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: Colors.white,
    fontSize: FontSize.xl,
  },
  container: {
    padding: Spacing.xl,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.xl,
  },
  desc: {
    color: Colors.muted,
    fontSize: FontSize.md,
    lineHeight: 22,
    textAlign: 'center',
  },
  topicsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  topicCard: {
    width: '47%',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.bgBorder,
    gap: Spacing.sm,
  },
  topicCardSelected: {
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  iconContainer: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topicIcon: {
    fontSize: 24,
    textAlign: 'center',
  },
  topicLabel: {
    color: Colors.white,
    fontSize: FontSize.sm,
    textAlign: 'center',
  },
  topicDiff: {
    fontSize: FontSize.xs,
    textTransform: 'capitalize',
  },
  startBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  startBtnDisabled: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.bgBorder,
    opacity: 0.5,
  },
  startBtnText: {
    color: Colors.white,
    fontSize: FontSize.lg,
  },
});
