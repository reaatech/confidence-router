import type {
  ClassificationResult,
  DecisionType,
  EvaluationDataset,
  EvaluationMetrics,
  LabeledExample,
  OptimizedThresholds,
  Prediction,
  RouterInterface,
  RoutingDecision,
} from '@reaatech/confidence-router-core';
import { RouterError, RouterErrorType } from '@reaatech/confidence-router-core';

export class ThresholdOptimizer {
  constructor(
    private router: RouterInterface,
    private dataset: EvaluationDataset,
  ) {
    this.validateDataset();
  }

  evaluateWithCurrentThresholds(): EvaluationMetrics {
    const decisions: RoutingDecision[] = [];
    const actuals: string[] = [];

    for (const example of this.dataset.examples) {
      const classification = this.createClassification(example);
      decisions.push(this.router.decide(classification));
      actuals.push(example.expectedLabel);
    }

    return this.calculateMetrics(decisions, actuals);
  }

  gridSearch(routeThresholds?: number[], fallbackThresholds?: number[]): OptimizedThresholds {
    const originalConfig = this.router.getConfig();

    const routeCandidates = routeThresholds ?? this.generateRange(0.5, 0.95, 0.05);
    const fallbackCandidates = fallbackThresholds ?? this.generateRange(0.1, 0.5, 0.05);

    let bestScore = -1;
    let bestThresholds = {
      routeThreshold: originalConfig.routeThreshold,
      fallbackThreshold: originalConfig.fallbackThreshold,
    };
    let bestMetrics: EvaluationMetrics | null = null;

    try {
      for (const route of routeCandidates) {
        for (const fallback of fallbackCandidates) {
          if (fallback >= route) continue;

          this.router.updateConfig({
            routeThreshold: route,
            fallbackThreshold: fallback,
          });

          const metrics = this.evaluateWithCurrentThresholds();
          const score = metrics.f1Score;

          if (score > bestScore) {
            bestScore = score;
            bestThresholds = { routeThreshold: route, fallbackThreshold: fallback };
            bestMetrics = metrics;
          }
        }
      }
    } finally {
      this.router.updateConfig({
        routeThreshold: originalConfig.routeThreshold,
        fallbackThreshold: originalConfig.fallbackThreshold,
      });
    }

    if (!bestMetrics) {
      throw new RouterError(
        RouterErrorType.CONFIGURATION_ERROR,
        'Threshold optimization failed: no valid threshold combination found',
      );
    }

    return {
      routeThreshold: bestThresholds.routeThreshold,
      fallbackThreshold: bestThresholds.fallbackThreshold,
      score: bestScore,
      metrics: bestMetrics,
    };
  }

  private validateDataset(): void {
    if (!this.dataset.examples || this.dataset.examples.length === 0) {
      throw new RouterError(RouterErrorType.DATASET_INVALID, 'Dataset is empty or invalid');
    }

    for (const example of this.dataset.examples) {
      if (!example.input || !example.expectedLabel) {
        throw new RouterError(
          RouterErrorType.DATASET_INVALID,
          'Dataset example missing required fields: input and expectedLabel',
        );
      }
    }
  }

  private createClassification(example: LabeledExample): ClassificationResult {
    if (example.predictions && example.predictions.length > 0) {
      return {
        predictions: example.predictions,
        metadata: example.context,
      };
    }

    const confidence = this.hashConfidence(example.input);
    const distractors = this.generateDistractors(example.expectedLabel, example.input);

    return {
      predictions: [{ label: example.expectedLabel, confidence }, ...distractors],
      metadata: example.context,
    };
  }

  private hashConfidence(input: string): number {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      hash = (hash << 5) - hash + input.charCodeAt(i);
      hash |= 0;
    }
    const normalized = (Math.abs(hash) % 1000) / 1000;
    return Math.round((0.25 + normalized * 0.7) * 100) / 100;
  }

  private generateDistractors(expectedLabel: string, input: string): Prediction[] {
    const distractorLabels = ['other_intent_a', 'other_intent_b'];
    const distractors: Prediction[] = [];

    for (let i = 0; i < distractorLabels.length; i++) {
      const conf = Math.max(
        0.05,
        Math.round(this.hashConfidence(input + String(i)) * 0.5 * 100) / 100,
      );
      distractors.push({ label: distractorLabels[i], confidence: conf });
    }

    return distractors.filter((d) => d.label !== expectedLabel);
  }

  private calculateMetrics(decisions: RoutingDecision[], actuals: string[]): EvaluationMetrics {
    const confusionMatrix: Record<string, Record<string, number>> = {};
    let correct = 0;
    const decisionsByType: Record<DecisionType, number> = { ROUTE: 0, CLARIFY: 0, FALLBACK: 0 };

    for (let i = 0; i < decisions.length; i++) {
      const decision = decisions[i];
      const actual = actuals[i];
      const predicted = decision.target || decision.type;

      decisionsByType[decision.type] = (decisionsByType[decision.type] || 0) + 1;

      if (!confusionMatrix[actual]) {
        confusionMatrix[actual] = {};
      }
      confusionMatrix[actual][predicted] = (confusionMatrix[actual][predicted] || 0) + 1;

      if (predicted === actual) {
        correct++;
      }
    }

    const total = decisions.length;
    const accuracy = total > 0 ? correct / total : 0;

    const { precision, recall } = this.calculatePrecisionRecall(confusionMatrix);
    const f1Score = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;

    return {
      accuracy,
      precision,
      recall,
      f1Score,
      confusionMatrix,
      decisionsByType,
    };
  }

  private calculatePrecisionRecall(matrix: Record<string, Record<string, number>>): {
    precision: number;
    recall: number;
  } {
    const classes = new Set<string>();
    for (const actual of Object.keys(matrix)) {
      classes.add(actual);
      for (const predicted of Object.keys(matrix[actual])) {
        classes.add(predicted);
      }
    }

    let totalPrecision = 0;
    let totalRecall = 0;
    let validPrecisionCount = 0;
    let validRecallCount = 0;

    for (const cls of classes) {
      const tp = matrix[cls]?.[cls] || 0;

      let fp = 0;
      for (const actual of Object.keys(matrix)) {
        if (actual !== cls) {
          fp += matrix[actual][cls] || 0;
        }
      }

      let fn = 0;
      const row = matrix[cls] || {};
      for (const predicted of Object.keys(row)) {
        if (predicted !== cls) {
          fn += row[predicted];
        }
      }

      if (tp + fp > 0) {
        totalPrecision += tp / (tp + fp);
        validPrecisionCount++;
      }
      if (tp + fn > 0) {
        totalRecall += tp / (tp + fn);
        validRecallCount++;
      }
    }

    const precision = validPrecisionCount > 0 ? totalPrecision / validPrecisionCount : 0;
    const recall = validRecallCount > 0 ? totalRecall / validRecallCount : 0;

    return { precision, recall };
  }

  private generateRange(start: number, end: number, step: number): number[] {
    const range: number[] = [];
    const steps = Math.round((end - start) / step);
    for (let i = 0; i <= steps; i++) {
      range.push(Math.round((start + i * step) * 100) / 100);
    }
    return range;
  }
}
