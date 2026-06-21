import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { useProgressStore } from '../store/progressStore';
import type { SessionRecord } from '../data/repository';
import { Colors, FontFamily, FontSize, Spacing, Radius } from '../constants/theme';

const CHART_CONFIG = {
  backgroundGradientFrom: Colors.bgCard,
  backgroundGradientTo: Colors.bgCard,
  color: (opacity = 1) => `rgba(108, 99, 255, ${opacity})`,
  labelColor: () => Colors.muted,
  strokeWidth: 2,
  barPercentage: 0.6,
  decimalPlaces: 0,
};

export default function DashboardScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const chartWidth = width - Spacing.xl * 2;

  const { xp, level, totalGames, masteryByTopic, wrongAnswerLog, sessionHistory } =
    useProgressStore();

  // Build accuracy by topic data
  const topicEntries = Object.entries(masteryByTopic).slice(0, 6);
  const topicLabels = topicEntries.map(([k]) =>
    k.replace('algebra-', 'alg-').replace('systems-', 'sys-').replace('addition', 'add').replace('subtraction', 'sub').replace('multiplication', 'mul').replace('division', 'div')
  );
  const topicAccuracies = topicEntries.map(([, v]) =>
    v.attempts > 0 ? Math.round((v.correct / v.attempts) * 100) : 0,
  );

  // Session history chart (last 7), newest-first from store so reverse
  const sessions: SessionRecord[] = sessionHistory.slice(0, 7).reverse();
  const sessionScores = sessions.length > 0 ? sessions.map(s => s.score) : [0];
  const sessionLabels = sessions.map((_, i) => `${i + 1}`);

  // Weakest topics
  const weakTopics = Object.entries(masteryByTopic)
    .filter(([, v]) => v.attempts >= 3)
    .map(([k, v]) => ({ topic: k, accuracy: v.correct / v.attempts }))
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 3);

  const overallAccuracy = topicEntries.length > 0
    ? Math.round(
        topicEntries.reduce((sum, [, v]) => sum + (v.attempts > 0 ? v.correct / v.attempts : 0), 0) /
          topicEntries.length *
          100,
      )
    : 0;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Overview cards */}
        <View style={styles.overviewRow}>
          {[
            { label: 'Level', value: `${level}` },
            { label: 'Total XP', value: xp.toLocaleString() },
            { label: 'Games', value: `${totalGames}` },
            { label: 'Accuracy', value: `${overallAccuracy}%` },
          ].map(({ label, value }) => (
            <View key={label} style={styles.overviewCard}>
              <Text style={styles.overviewValue}>{value}</Text>
              <Text style={styles.overviewLabel}>{label}</Text>
            </View>
          ))}
        </View>

        {/* Accuracy by topic */}
        {topicLabels.length > 0 && (
          <View style={styles.chartSection}>
            <Text style={styles.sectionTitle}>Accuracy by Topic</Text>
            <BarChart
              data={{ labels: topicLabels, datasets: [{ data: topicAccuracies }] }}
              width={chartWidth}
              height={200}
              chartConfig={CHART_CONFIG}
              style={styles.chart}
              fromZero
              yAxisSuffix="%"
              yAxisLabel=""
              showValuesOnTopOfBars
            />
          </View>
        )}

        {/* Score history */}
        {sessionScores.length > 1 && (
          <View style={styles.chartSection}>
            <Text style={styles.sectionTitle}>Recent Scores</Text>
            <LineChart
              data={{ labels: sessionLabels, datasets: [{ data: sessionScores }] }}
              width={chartWidth}
              height={180}
              chartConfig={CHART_CONFIG}
              style={styles.chart}
              bezier
            />
          </View>
        )}

        {/* Weakest topics */}
        {weakTopics.length > 0 && (
          <View style={styles.weakSection}>
            <Text style={styles.sectionTitle}>📌 Needs Practice</Text>
            {weakTopics.map(({ topic, accuracy }) => (
              <View key={topic} style={styles.weakCard}>
                <Text style={styles.weakTopic}>{topic.replace(/-/g, ' ')}</Text>
                <View style={styles.weakBar}>
                  <View
                    style={[
                      styles.weakBarFill,
                      {
                        width: `${Math.round(accuracy * 100)}%`,
                        backgroundColor:
                          accuracy > 0.7 ? Colors.easy : accuracy > 0.4 ? Colors.medium : Colors.hard,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.weakPct}>{Math.round(accuracy * 100)}%</Text>
              </View>
            ))}
          </View>
        )}

        {/* Wrong answer history */}
        {wrongAnswerLog.length > 0 && (
          <View style={styles.wrongSection}>
            <Text style={styles.sectionTitle}>Wrong Answer History</Text>
            {wrongAnswerLog.slice(0, 10).map((entry, i) => (
              <View key={i} style={styles.wrongRow}>
                <Text style={styles.wrongEq}>{entry.equation}</Text>
                <Text style={styles.wrongCorrect}>{entry.correctAnswer}</Text>
              </View>
            ))}
          </View>
        )}

        {totalGames === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🎮</Text>
            <Text style={styles.emptyTitle}>No data yet</Text>
            <Text style={styles.emptySubtitle}>Play a game to see your progress here!</Text>
          </View>
        )}
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
  overviewRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  overviewCard: {
    flex: 1,
    minWidth: 80,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.bgBorder,
  },
  overviewValue: {
    color: Colors.white,
    fontSize: FontSize.xl,
    fontFamily: FontFamily.heading,
  },
  overviewLabel: {
    color: Colors.muted,
    fontSize: FontSize.xs,
    fontFamily: FontFamily.body,
    marginTop: 2,
  },
  chartSection: { gap: Spacing.sm },
  sectionTitle: {
    color: Colors.offWhite,
    fontSize: FontSize.lg,
    fontFamily: FontFamily.heading,
  },
  chart: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  weakSection: { gap: Spacing.sm },
  weakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.bgBorder,
  },
  weakTopic: {
    flex: 1,
    color: Colors.offWhite,
    fontSize: FontSize.sm,
    fontFamily: FontFamily.body,
    textTransform: 'capitalize',
  },
  weakBar: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.bgSurface,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  weakBarFill: {
    height: '100%',
    borderRadius: Radius.full,
  },
  weakPct: {
    width: 36,
    textAlign: 'right',
    color: Colors.muted,
    fontSize: FontSize.sm,
    fontFamily: FontFamily.monoBold,
  },
  wrongSection: { gap: Spacing.sm },
  wrongRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.bgBorder,
  },
  wrongEq: {
    color: Colors.offWhite,
    fontSize: FontSize.sm,
    fontFamily: FontFamily.mono,
    flex: 1,
  },
  wrongCorrect: {
    color: Colors.success,
    fontSize: FontSize.sm,
    fontFamily: FontFamily.monoBold,
  },
  emptyState: {
    alignItems: 'center',
    padding: Spacing.xxxl,
    gap: Spacing.md,
  },
  emptyEmoji: { fontSize: 56 },
  emptyTitle: {
    color: Colors.white,
    fontSize: FontSize.xl,
    fontFamily: FontFamily.heading,
  },
  emptySubtitle: {
    color: Colors.muted,
    fontSize: FontSize.md,
    fontFamily: FontFamily.body,
  },
});
