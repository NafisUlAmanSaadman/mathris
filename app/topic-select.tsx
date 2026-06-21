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
import { Colors, FontFamily, FontSize, Spacing, Radius } from '../constants/theme';
import type { EquationTopic } from '../engine/equations';
import type { Difficulty } from '../constants/config';

interface TopicOption {
  topic: EquationTopic;
  label: string;
  difficulty: Difficulty;
  icon: string;
}

const TOPICS: TopicOption[] = [
  { topic: 'addition', label: 'Addition', difficulty: 'easy', icon: '➕' },
  { topic: 'subtraction', label: 'Subtraction', difficulty: 'easy', icon: '➖' },
  { topic: 'multiplication', label: 'Multiplication', difficulty: 'easy', icon: '✖️' },
  { topic: 'division', label: 'Division', difficulty: 'easy', icon: '➗' },
  { topic: 'algebra-one-step', label: 'One-Step Algebra', difficulty: 'medium', icon: '🔡' },
  { topic: 'algebra-two-step', label: 'Two-Step Algebra', difficulty: 'medium', icon: '🔢' },
  { topic: 'algebra-rational', label: 'Rational Equations', difficulty: 'medium', icon: '÷' },
  { topic: 'systems-integer', label: 'Systems of Equations', difficulty: 'hard', icon: '🧮' },
];

const DIFF_COLORS: Record<Difficulty, string> = {
  easy: Colors.easy,
  medium: Colors.medium,
  hard: Colors.hard,
};

export default function TopicSelectScreen() {
  const router = useRouter();
  const { setDifficulty, resetGame } = useGameStore();
  const [selected, setSelected] = useState<TopicOption | null>(null);

  const handleStart = () => {
    if (!selected) return;
    resetGame();
    setDifficulty(selected.difficulty);
    router.push('/game');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Practice Mode</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.desc}>
          Pick a topic to drill. Only equations from that topic will fall — perfect for targeting weak spots.
        </Text>

        <View style={styles.topicsGrid}>
          {TOPICS.map(opt => (
            <TouchableOpacity
              key={opt.topic}
              style={[
                styles.topicCard,
                selected?.topic === opt.topic && {
                  borderColor: DIFF_COLORS[opt.difficulty],
                  borderWidth: 2,
                },
              ]}
              onPress={() => setSelected(opt)}
              activeOpacity={0.8}
            >
              <Text style={styles.topicIcon}>{opt.icon}</Text>
              <Text style={styles.topicLabel}>{opt.label}</Text>
              <Text style={[styles.topicDiff, { color: DIFF_COLORS[opt.difficulty] }]}>
                {opt.difficulty}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.startBtn, !selected && styles.startBtnDisabled]}
          onPress={handleStart}
          disabled={!selected}
        >
          <Text style={styles.startBtnText}>
            {selected ? `▶  Practice ${selected.label}` : 'Select a topic above'}
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
    fontFamily: FontFamily.heading,
  },
  container: {
    padding: Spacing.xl,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.xl,
  },
  desc: {
    color: Colors.muted,
    fontSize: FontSize.md,
    fontFamily: FontFamily.body,
    lineHeight: 22,
    textAlign: 'center',
  },
  topicsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
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
  topicIcon: { fontSize: 32 },
  topicLabel: {
    color: Colors.white,
    fontSize: FontSize.sm,
    fontFamily: FontFamily.headingMedium,
    textAlign: 'center',
  },
  topicDiff: {
    fontSize: FontSize.xs,
    fontFamily: FontFamily.body,
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
  },
  startBtnText: {
    color: Colors.white,
    fontSize: FontSize.lg,
    fontFamily: FontFamily.heading,
  },
});
