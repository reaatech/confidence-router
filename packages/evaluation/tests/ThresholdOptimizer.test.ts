import type {
  ClassificationResult,
  EvaluationDataset,
  RouterConfig,
  RouterInterface,
  RoutingDecision,
} from '@reaatech/confidence-router-core';
import { describe, expect, it } from 'vitest';
import { ThresholdOptimizer } from '../src/ThresholdOptimizer.js';

class MockRouter implements RouterInterface {
  config: RouterConfig = {
    routeThreshold: 0.8,
    fallbackThreshold: 0.3,
    clarificationEnabled: true,
  };

  decide(classification: ClassificationResult): RoutingDecision {
    const top = classification.predictions.reduce((a, b) => (b.confidence > a.confidence ? b : a));
    if (top.confidence >= this.config.routeThreshold) {
      return { type: 'ROUTE', target: top.label, confidence: top.confidence };
    }
    if (top.confidence < this.config.fallbackThreshold) {
      return { type: 'FALLBACK', confidence: top.confidence };
    }
    return { type: 'CLARIFY', confidence: top.confidence };
  }

  getConfig(): RouterConfig {
    return { ...this.config };
  }

  updateConfig(partial: Partial<RouterConfig>): void {
    this.config = { ...this.config, ...partial };
  }
}

describe('ThresholdOptimizer', () => {
  it('evaluates with current thresholds', () => {
    const dataset: EvaluationDataset = {
      examples: [
        {
          input: 'book a flight',
          expectedLabel: 'book_flight',
          predictions: [{ label: 'book_flight', confidence: 0.92 }],
        },
        {
          input: 'check status',
          expectedLabel: 'check_status',
          predictions: [{ label: 'check_status', confidence: 0.55 }],
        },
      ],
    };

    const optimizer = new ThresholdOptimizer(new MockRouter(), dataset);
    const metrics = optimizer.evaluateWithCurrentThresholds();

    expect(metrics.accuracy).toBeDefined();
    expect(metrics.precision).toBeDefined();
    expect(metrics.f1Score).toBeDefined();
    expect(metrics.decisionsByType.ROUTE).toBeGreaterThanOrEqual(0);
  });

  it('performs grid search with synthetic data', () => {
    const dataset: EvaluationDataset = {
      examples: [
        { input: 'book a flight to Paris', expectedLabel: 'book_flight' },
        { input: 'cancel my reservation', expectedLabel: 'cancel_booking' },
        { input: 'check my flight status', expectedLabel: 'check_status' },
      ],
    };

    const optimizer = new ThresholdOptimizer(new MockRouter(), dataset);
    const result = optimizer.gridSearch();

    expect(result.routeThreshold).toBeDefined();
    expect(result.fallbackThreshold).toBeDefined();
    expect(result.score).toBeGreaterThan(-1);
    expect(result.metrics).toBeDefined();
  });
});
