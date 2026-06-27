import type { MasteryEntry } from '../data/repository';

export interface MLReport {
  totalSamples: number;
  predictions: Array<{
    topic: string;
    predictedErrorRate: number; // 0.0 – 1.0
  }>;
}

// All equation topics mapped to indexes for one-hot encoding
export const ML_TOPICS = [
  'addition',
  'subtraction',
  'multiplication',
  'division',
  'mixed',
  'algebra-one-step',
  'algebra-two-step',
  'algebra-rational',
  'systems-integer',
  'systems-decimal',
] as const;

export type MLTopic = (typeof ML_TOPICS)[number];

// Helper: get topic difficulty factor
function getTopicDifficultyFactor(topic: string): number {
  if (['addition', 'subtraction', 'multiplication', 'division', 'mixed'].includes(topic)) {
    return 1.0; // Easy
  }
  if (['algebra-one-step', 'algebra-two-step', 'algebra-rational'].includes(topic)) {
    return 2.0; // Medium
  }
  return 3.0; // Hard
}

/**
 * MathMasteryModel — Historical Statistics and Topic Recommendation Model
 * Models the probability of a player failing a given equation type based on historical stats:
 * P(Fail) = (attempts - correct) / attempts (defaulting to 0 if no attempts have been made)
 */
export class MathMasteryModel {
  public train(masteryData: Record<string, MasteryEntry>): MLReport {
    const predictions = ML_TOPICS.map(topic => {
      const stats = masteryData[topic] ?? { attempts: 0, correct: 0 };
      const predictedErrorRate = stats.attempts > 0 ? (stats.attempts - stats.correct) / stats.attempts : 0.0;
      return {
        topic,
        predictedErrorRate,
      };
    });

    const totalSamples = Object.values(masteryData).reduce((sum, v) => sum + v.attempts, 0);

    return {
      totalSamples,
      predictions: predictions.sort((a, b) => b.predictedErrorRate - a.predictedErrorRate), // Hardest first
    };
  }

  /**
   * Get weights for roulette selection of weak areas.
   * If adaptive practice is enabled, we select topics proportional to their historical error rate.
   */
  public getWeightedTopicList(
    difficulty: 'easy' | 'medium' | 'hard',
    masteryData: Record<string, MasteryEntry>,
  ): Array<{ topic: string; weight: number }> {
    const report = this.train(masteryData);

    // Filter topics matching the requested difficulty
    const targetTopics = report.predictions.filter(p => {
      const fact = getTopicDifficultyFactor(p.topic);
      if (difficulty === 'easy') return fact === 1.0;
      if (difficulty === 'medium') return fact === 2.0;
      return fact === 3.0; // hard
    });

    // Compute weights: we want topics with HIGHER historical error rate to have HIGHER selection probability
    // We add a baseline constant (e.g. 0.1) to ensure even mastered topics have a tiny chance of appearing.
    // If a topic has 0 attempts, we give it a default baseline weight of 0.5 to encourage initial practice.
    return targetTopics.map(t => {
      const stats = masteryData[t.topic] ?? { attempts: 0, correct: 0 };
      const weight = stats.attempts === 0 ? 0.5 : t.predictedErrorRate + 0.1;
      return {
        topic: t.topic,
        weight,
      };
    });
  }
}
