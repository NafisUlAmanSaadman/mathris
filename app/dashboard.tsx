import React, { useMemo } from 'react';
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
import { useProgressStore, useFontFamily } from '../store/progressStore';
import type { SessionRecord } from '../data/repository';
import { Colors, FontSize, Spacing, Radius } from '../constants/theme';
import { MathMasteryModel } from '../engine/mlModel';
import { triggerImpactHaptic } from '../utils/haptics';

const CHART_CONFIG = {
  backgroundGradientFrom: Colors.bgCard,
  backgroundGradientTo: Colors.bgCard,
  color: (opacity = 1) => `rgba(232, 115, 90, ${opacity})`, // coral color
  labelColor: () => Colors.muted,
  strokeWidth: 2,
  barPercentage: 0.6,
  decimalPlaces: 0,
};

export default function DashboardScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const chartWidth = width - Spacing.xl * 2;

  // Typography for dyslexia accessibility
  const headingFont = useFontFamily('heading');
  const headingMediumFont = useFontFamily('headingMedium');
  const bodyFont = useFontFamily('body');
  const monoFont = useFontFamily('mono');
  const monoBoldFont = useFontFamily('monoBold');

  const { xp, level, totalGames, masteryByTopic, wrongAnswerLog, sessionHistory } =
    useProgressStore();

  // Run On-Device ML Model Training on current mastery logs
  const mlModel = useMemo(() => new MathMasteryModel(), []);
  const mlReport = useMemo(() => mlModel.train(masteryByTopic), [masteryByTopic]);

  // Compute stats directly from practice history
  const totalAttempts = useMemo(() => Object.values(masteryByTopic).reduce((sum, v) => sum + v.attempts, 0), [masteryByTopic]);
  const totalCorrect = useMemo(() => Object.values(masteryByTopic).reduce((sum, v) => sum + v.correct, 0), [masteryByTopic]);
  const avgAccuracy = useMemo(() => totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0, [totalAttempts, totalCorrect]);

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
        <Text style={[styles.headerTitle, { fontFamily: headingFont }]}>Dashboard</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Overview cards */}
        <View style={styles.overviewRow}>
          {[
            { label: 'Level', value: `${level}` },
            { label: 'Total XP', value: xp.toLocaleString() },
            { label: 'Games Played', value: `${totalGames}` },
            { label: 'Avg Accuracy', value: `${overallAccuracy}%` },
          ].map(({ label, value }) => (
            <View key={label} style={styles.overviewCard}>
              <Text style={[styles.overviewValue, { fontFamily: headingFont }]}>{value}</Text>
              <Text style={[styles.overviewLabel, { fontFamily: bodyFont }]}>{label}</Text>
            </View>
          ))}
        </View>

        {/* Historical Stats & Struggle Rates */}
        <View style={styles.mlSection}>
          <Text style={[styles.sectionTitle, { fontFamily: headingFont }]}>Learning Profile</Text>
          <View style={styles.mlInfoBox}>
            <View style={styles.mlMetricsRow}>
              <View style={styles.mlMetricMini}>
                <Text style={[styles.mlMetricLabel, { fontFamily: bodyFont }]}>Total Attempts</Text>
                <Text style={[styles.mlMetricValue, { fontFamily: monoBoldFont }]}>{totalAttempts}</Text>
              </View>
              <View style={styles.mlMetricMini}>
                <Text style={[styles.mlMetricLabel, { fontFamily: bodyFont }]}>Correct Answers</Text>
                <Text style={[styles.mlMetricValue, { fontFamily: monoBoldFont }]}>{totalCorrect}</Text>
              </View>
              <View style={styles.mlMetricMini}>
                <Text style={[styles.mlMetricLabel, { fontFamily: bodyFont }]}>Avg Accuracy</Text>
                <Text style={[styles.mlMetricValue, { fontFamily: monoBoldFont }]}>{avgAccuracy}%</Text>
              </View>
            </View>
            <Text style={[styles.mlDescription, { fontFamily: bodyFont }]}>
              Your historical struggle rates per math topic, calculated directly from your practice answers.
            </Text>
          </View>

          {/* Predictions list */}
          <Text style={[styles.sectionSubtitle, { fontFamily: headingMediumFont }]}>Predicted Struggle Rates</Text>
          <View style={styles.predictionsList}>
            {mlReport.predictions.map(pred => {
              const errorPct = Math.round(pred.predictedErrorRate * 100);
              return (
                <View key={pred.topic} style={styles.predictRow}>
                  <Text style={[styles.predictTopic, { fontFamily: bodyFont }]}>
                    {pred.topic.replace(/-/g, ' ')}
                  </Text>
                  <View style={styles.predictBarWrapper}>
                    <View style={styles.predictBarBackground}>
                      <View
                        style={[
                          styles.predictBarFill,
                          {
                            width: `${errorPct}%`,
                            backgroundColor:
                              errorPct > 60 ? Colors.hard : errorPct > 30 ? Colors.medium : Colors.easy,
                          },
                        ]}
                      />
                    </View>
                  </View>
                  <Text style={[styles.predictValue, { fontFamily: monoBoldFont }]}>{errorPct}%</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Accuracy by topic */}
        {topicLabels.length > 0 && (
          <View style={styles.chartSection}>
            <Text style={[styles.sectionTitle, { fontFamily: headingFont }]}>Accuracy by Topic</Text>
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
            <Text style={[styles.sectionTitle, { fontFamily: headingFont }]}>Recent Scores</Text>
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
            <Text style={[styles.sectionTitle, { fontFamily: headingFont }]}>Needs Practice</Text>
            {weakTopics.map(({ topic, accuracy }) => (
              <View key={topic} style={styles.weakCard}>
                <Text style={[styles.weakTopic, { fontFamily: bodyFont }]}>{topic.replace(/-/g, ' ')}</Text>
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
                <Text style={[styles.weakPct, { fontFamily: monoBoldFont }]}>{Math.round(accuracy * 100)}%</Text>
              </View>
            ))}
          </View>
        )}

        {/* Wrong answer history */}
        {wrongAnswerLog.length > 0 && (
          <View style={styles.wrongSection}>
            <Text style={[styles.sectionTitle, { fontFamily: headingFont }]}>Wrong Answer History</Text>
            {wrongAnswerLog.slice(0, 10).map((entry, i) => (
              <View key={i} style={styles.wrongRow}>
                <Text style={[styles.wrongEq, { fontFamily: monoFont }]}>{entry.equation}</Text>
                <Text style={[styles.wrongCorrect, { fontFamily: monoBoldFont }]}>{entry.correctAnswer}</Text>
              </View>
            ))}
          </View>
        )}

        {totalGames === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🎮</Text>
            <Text style={[styles.emptyTitle, { fontFamily: headingFont }]}>No data yet</Text>
            <Text style={[styles.emptySubtitle, { fontFamily: bodyFont }]}>Play a game to see your progress here!</Text>
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
  },
  overviewLabel: {
    color: Colors.muted,
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  chartSection: { gap: Spacing.sm },
  sectionTitle: {
    color: Colors.offWhite,
    fontSize: FontSize.lg,
    letterSpacing: 0.5,
  },
  sectionSubtitle: {
    color: Colors.muted,
    fontSize: FontSize.sm,
    marginTop: Spacing.sm,
  },
  chart: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  // ML Section Styles
  mlSection: {
    gap: Spacing.sm,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.bgBorder,
  },
  mlInfoBox: {
    backgroundColor: Colors.bgSurface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  mlMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.xs,
  },
  mlMetricMini: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.xs,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.bgBorder,
  },
  mlMetricLabel: {
    color: Colors.muted,
    fontSize: 9,
  },
  mlMetricValue: {
    color: Colors.white,
    fontSize: FontSize.sm,
    marginTop: 2,
  },
  mlDescription: {
    color: Colors.offWhite,
    fontSize: 11,
    lineHeight: 16,
    opacity: 0.8,
  },
  predictionsList: {
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  predictRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  predictTopic: {
    width: 100,
    color: Colors.offWhite,
    fontSize: FontSize.xs,
    textTransform: 'capitalize',
  },
  predictBarWrapper: {
    flex: 1,
  },
  predictBarBackground: {
    height: 8,
    backgroundColor: Colors.bgSurface,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  predictBarFill: {
    height: '100%',
    borderRadius: Radius.full,
  },
  predictValue: {
    width: 32,
    textAlign: 'right',
    color: Colors.muted,
    fontSize: FontSize.xs,
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
    flex: 1,
  },
  wrongCorrect: {
    color: Colors.success,
    fontSize: FontSize.sm,
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
  },
  emptySubtitle: {
    color: Colors.muted,
    fontSize: FontSize.md,
  },
});
