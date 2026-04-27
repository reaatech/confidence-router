import { describe, it, expect } from 'vitest';
import { ConfidenceRouter } from '../../src/core/ConfidenceRouter.js';
import type { Classifier, ClassificationResult } from '../../src/types/index.js';

describe('Router Integration', () => {
  const createMockClassifier = (name: string, label: string, confidence: number): Classifier => ({
    name,
    type: 'custom',
    enabled: true,
    priority: 1,
    classify: async (): Promise<ClassificationResult> => ({
      predictions: [{ label, confidence }],
    }),
  });

  it('should process input through full pipeline', async () => {
    const router = new ConfidenceRouter({
      routeThreshold: 0.8,
      fallbackThreshold: 0.3,
      clarificationEnabled: true,
    });

    router.registerClassifier(createMockClassifier('mock', 'book_flight', 0.9));

    const decision = await router.process('book a flight');

    expect(decision.type).toBe('ROUTE');
    expect(decision.target).toBe('book_flight');
  });

  it('should handle clarification through full pipeline', async () => {
    const router = new ConfidenceRouter({
      routeThreshold: 0.8,
      fallbackThreshold: 0.3,
      clarificationEnabled: true,
    });

    router.registerClassifier(createMockClassifier('mock', 'check_status', 0.5));

    const decision = await router.process('check my booking');

    expect(decision.type).toBe('CLARIFY');
    expect(decision.prompt).toBeDefined();
  });

  it('should evaluate dataset with current thresholds', () => {
    const router = new ConfidenceRouter({
      routeThreshold: 0.8,
      fallbackThreshold: 0.3,
      clarificationEnabled: true,
    });

    const dataset = {
      examples: [
        { input: 'book a flight', expectedLabel: 'book_flight' },
        { input: 'check status', expectedLabel: 'check_status' },
      ],
    };

    const metrics = router.evaluate(dataset);

    expect(metrics.accuracy).toBeGreaterThanOrEqual(0);
    expect(metrics.f1Score).toBeGreaterThanOrEqual(0);
  });

  it('should optimize thresholds with grid search', () => {
    const router = new ConfidenceRouter({
      routeThreshold: 0.8,
      fallbackThreshold: 0.3,
      clarificationEnabled: true,
    });

    const dataset = {
      examples: [
        { input: 'book a flight', expectedLabel: 'book_flight' },
        { input: 'check status', expectedLabel: 'check_status' },
        { input: 'cancel booking', expectedLabel: 'cancel_booking' },
      ],
    };

    const result = router.optimizeThresholds(dataset, [0.7, 0.8], [0.2, 0.3]);

    expect(result.routeThreshold).toBeDefined();
    expect(result.fallbackThreshold).toBeDefined();
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.metrics).toBeDefined();
  });

  it('should handle classifier fallback chain', async () => {
    const router = new ConfidenceRouter();

    const failingClassifier: Classifier = {
      name: 'failing',
      type: 'custom',
      enabled: true,
      priority: 1,
      classify: async () => {
        throw new Error('Classifier failed');
      },
    };

    const backupClassifier = createMockClassifier('backup', 'backup_result', 0.9);

    router.registerClassifier(failingClassifier);
    router.registerClassifier(backupClassifier);

    const result = await router.classifyWithFallback('test');
    expect(result.predictions[0].label).toBe('backup_result');
  });

  it('should use specific classifier by name', async () => {
    const router = new ConfidenceRouter();

    const classifierA = createMockClassifier('a', 'result_a', 0.9);
    const classifierB = createMockClassifier('b', 'result_b', 0.9);

    router.registerClassifier(classifierA);
    router.registerClassifier(classifierB);

    const result = await router.classify('test', 'b');
    expect(result.predictions[0].label).toBe('result_b');
  });
});
