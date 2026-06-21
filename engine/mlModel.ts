import type { MasteryEntry } from '../data/repository';

export interface MLReport {
  loss: number;
  totalSamples: number;
  epochsRun: number;
  predictions: Array<{
    topic: string;
    predictedErrorRate: number; // 0.0 – 1.0
  }>;
  weightsSummary: Record<string, number>;
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

// Helper: sigmoid function
function sigmoid(z: number): number {
  return 1 / (1 + Math.exp(-Math.max(-20, Math.min(20, z))));
}

// Helper: get topic difficulty factor
export function getTopicDifficultyFactor(topic: string): number {
  if (['addition', 'subtraction', 'multiplication', 'division', 'mixed'].includes(topic)) {
    return 1.0; // Easy
  }
  if (['algebra-one-step', 'algebra-two-step', 'algebra-rational'].includes(topic)) {
    return 2.0; // Medium
  }
  return 3.0; // Hard
}

/**
 * MathMasteryModel — On-Device Logistic Regression Model
 * Models the probability of a player failing a given equation type:
 * P(Fail = 1) = Sigmoid(W0 + W1 * Difficulty + W_topic_one_hot)
 */
export class MathMasteryModel {
  // Weights array: Index 0 is bias, Index 1 is difficulty, Indices 2..11 are topics
  private weights: number[];

  constructor() {
    // Initialise weights to 0 (neutral)
    this.weights = new Array(2 + ML_TOPICS.length).fill(0.0);
  }

  /**
   * Train the logistic regression classifier using SGD.
   * @param masteryData accuracy aggregate data per topic from progressStore
   */
  public train(masteryData: Record<string, MasteryEntry>): MLReport {
    // 1. Build training dataset from aggregates
    const dataset: Array<{ x: number[]; y: number }> = [];

    Object.entries(masteryData).forEach(([topic, stats]) => {
      const topicIndex = ML_TOPICS.indexOf(topic as any);
      if (topicIndex === -1) return;

      const diffFactor = getTopicDifficultyFactor(topic);

      // Create one-hot topic vector
      const oneHot = new Array(ML_TOPICS.length).fill(0.0);
      oneHot[topicIndex] = 1.0;

      const featureVector = [1.0, diffFactor, ...oneHot];

      // y = 1 for wrong (failed), y = 0 for correct
      const wrongs = stats.attempts - stats.correct;
      const corrects = stats.correct;

      for (let i = 0; i < wrongs; i++) {
        dataset.push({ x: featureVector, y: 1.0 });
      }
      for (let i = 0; i < corrects; i++) {
        dataset.push({ x: featureVector, y: 0.0 });
      }
    });

    const totalSamples = dataset.length;
    let finalLoss = 0.0;
    const epochs = 100;
    const learningRate = 0.05;

    // Reset weights if we have data to train
    if (totalSamples > 0) {
      this.weights = new Array(2 + ML_TOPICS.length).fill(0.0);

      // 2. Gradient Descent Loop
      for (let epoch = 0; epoch < epochs; epoch++) {
        // Shuffle dataset for Stochastic Gradient Descent
        const shuffled = [...dataset].sort(() => Math.random() - 0.5);

        for (const sample of shuffled) {
          // Dot product: W · X
          let z = 0.0;
          for (let j = 0; j < this.weights.length; j++) {
            z += this.weights[j] * sample.x[j];
          }

          const prediction = sigmoid(z);
          const error = sample.y - prediction;

          // Update weights: W_j = W_j + learningRate * error * X_j
          for (let j = 0; j < this.weights.length; j++) {
            this.weights[j] += learningRate * error * sample.x[j];
          }
        }
      }

      // 3. Compute final Binary Cross-Entropy Loss
      let totalLoss = 0.0;
      for (const sample of dataset) {
        let z = 0.0;
        for (let j = 0; j < this.weights.length; j++) {
          z += this.weights[j] * sample.x[j];
        }
        const pred = Math.max(1e-15, Math.min(1 - 1e-15, sigmoid(z)));
        totalLoss += -(sample.y * Math.log(pred) + (1 - sample.y) * Math.log(1 - pred));
      }
      finalLoss = totalLoss / totalSamples;
    } else {
      // Seed default baseline weights (slightly negative so base failure is low, e.g. ~20%)
      this.weights[0] = -1.38; // sigmoid(-1.38) ≈ 0.20
    }

    // 4. Generate Predictions & Report
    const predictions = ML_TOPICS.map(topic => {
      const topicIndex = ML_TOPICS.indexOf(topic);
      const diffFactor = getTopicDifficultyFactor(topic);

      const oneHot = new Array(ML_TOPICS.length).fill(0.0);
      oneHot[topicIndex] = 1.0;

      const x = [1.0, diffFactor, ...oneHot];
      let z = 0.0;
      for (let j = 0; j < this.weights.length; j++) {
        z += this.weights[j] * x[j];
      }

      return {
        topic,
        predictedErrorRate: sigmoid(z),
      };
    });

    const weightsSummary: Record<string, number> = {
      bias: parseFloat(this.weights[0].toFixed(3)),
      difficultyCoeff: parseFloat(this.weights[1].toFixed(3)),
    };
    ML_TOPICS.forEach((topic, idx) => {
      weightsSummary[`weight_${topic}`] = parseFloat(this.weights[2 + idx].toFixed(3));
    });

    return {
      loss: parseFloat(finalLoss.toFixed(4)),
      totalSamples,
      epochsRun: totalSamples > 0 ? epochs : 0,
      predictions: predictions.sort((a, b) => b.predictedErrorRate - a.predictedErrorRate), // Hardest first
      weightsSummary,
    };
  }

  /**
   * Get weights for roulette selection of weak areas.
   * If adaptive practice is enabled, we select topics proportional to their predicted error rate.
   */
  public getWeightedTopicList(
    difficulty: 'easy' | 'medium' | 'hard',
    masteryData: Record<string, MasteryEntry>,
  ): Array<{ topic: string; weight: number }> {
    // Train first to update weights
    const report = this.train(masteryData);

    // Filter topics matching the requested difficulty
    const targetTopics = report.predictions.filter(p => {
      const fact = getTopicDifficultyFactor(p.topic);
      if (difficulty === 'easy') return fact === 1.0;
      if (difficulty === 'medium') return fact === 2.0;
      return fact === 3.0; // hard
    });

    // Compute weights: we want topics with HIGHER predicted error rate to have HIGHER selection probability
    // We add a baseline constant (e.g. 0.05) to ensure even mastered topics have a tiny chance of appearing.
    return targetTopics.map(t => ({
      topic: t.topic,
      weight: t.predictedErrorRate + 0.1, // boost probability of failure types
    }));
  }
}
