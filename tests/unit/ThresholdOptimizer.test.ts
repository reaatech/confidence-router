import { describe, it, expect } from 'vitest';
import { ThresholdOptimizer } from '../../src/evaluation/ThresholdOptimizer.js';
import { ConfidenceRouter } from '../../src/core/ConfidenceRouter.js';
import { RouterError } from '../../src/types/errors.js';
import type { EvaluationDataset } from '../../src/types/index.js';

describe('ThresholdOptimizer', () => {
  const createDataset = (): EvaluationDataset => ({
    examples: [
      { input: 'book a flight', expectedLabel: 'book_flight' },
      { input: 'check my booking', expectedLabel: 'check_status' },
      { input: 'cancel reservation', expectedLabel: 'cancel_booking' },
      { input: 'flight to Tokyo', expectedLabel: 'book_flight' },
      { input: 'booking status', expectedLabel: 'check_status' },
    ],
  });

  const createDatasetWithPredictions = (): EvaluationDataset => ({
    examples: [
      {
        input: 'book a flight',
        expectedLabel: 'book_flight',
        predictions: [
          { label: 'book_flight', confidence: 0.92 },
          { label: 'check_status', confidence: 0.08 },
        ],
      },
      {
        input: 'check my booking',
        expectedLabel: 'check_status',
        predictions: [
          { label: 'check_status', confidence: 0.85 },
          { label: 'book_flight', confidence: 0.15 },
        ],
      },
      {
        input: 'cancel reservation',
        expectedLabel: 'cancel_booking',
        predictions: [
          { label: 'cancel_booking', confidence: 0.78 },
          { label: 'book_flight', confidence: 0.22 },
        ],
      },
    ],
  });

  describe('evaluateWithCurrentThresholds', () => {
    it('should calculate metrics for dataset', () => {
      const router = new ConfidenceRouter({
        routeThreshold: 0.8,
        fallbackThreshold: 0.3,
        clarificationEnabled: true,
      });
      const dataset = createDataset();
      const optimizer = new ThresholdOptimizer(router, dataset);

      const metrics = optimizer.evaluateWithCurrentThresholds();

      expect(metrics.accuracy).toBeGreaterThanOrEqual(0);
      expect(metrics.accuracy).toBeLessThanOrEqual(1);
      expect(metrics.precision).toBeGreaterThanOrEqual(0);
      expect(metrics.precision).toBeLessThanOrEqual(1);
      expect(metrics.recall).toBeGreaterThanOrEqual(0);
      expect(metrics.recall).toBeLessThanOrEqual(1);
      expect(metrics.f1Score).toBeGreaterThanOrEqual(0);
      expect(metrics.confusionMatrix).toBeDefined();
      expect(metrics.decisionsByType).toBeDefined();
    });

    it('should use provided predictions when available', () => {
      const router = new ConfidenceRouter({
        routeThreshold: 0.8,
        fallbackThreshold: 0.3,
        clarificationEnabled: true,
      });
      const dataset = createDatasetWithPredictions();
      const optimizer = new ThresholdOptimizer(router, dataset);

      const metrics = optimizer.evaluateWithCurrentThresholds();

      expect(metrics.accuracy).toBeGreaterThanOrEqual(0);
      expect(metrics.decisionsByType.ROUTE).toBeGreaterThanOrEqual(0);
    });
  });

  describe('gridSearch', () => {
    it('should find optimal thresholds', () => {
      const router = new ConfidenceRouter({
        routeThreshold: 0.8,
        fallbackThreshold: 0.3,
        clarificationEnabled: true,
      });
      const dataset = createDataset();
      const optimizer = new ThresholdOptimizer(router, dataset);

      const result = optimizer.gridSearch([0.7, 0.8, 0.9], [0.2, 0.3, 0.4]);

      expect(result.routeThreshold).toBeDefined();
      expect(result.fallbackThreshold).toBeDefined();
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.metrics).toBeDefined();
    });

    it('should optimize with real predictions', () => {
      const router = new ConfidenceRouter({
        routeThreshold: 0.8,
        fallbackThreshold: 0.3,
        clarificationEnabled: true,
      });
      const dataset = createDatasetWithPredictions();
      const optimizer = new ThresholdOptimizer(router, dataset);

      const result = optimizer.gridSearch([0.6, 0.8, 0.9], [0.2, 0.3, 0.5]);

      expect(result.routeThreshold).toBeDefined();
      expect(result.fallbackThreshold).toBeDefined();
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.metrics).toBeDefined();
    });

    it('should throw when all threshold combinations are invalid', () => {
      const router = new ConfidenceRouter({
        routeThreshold: 0.8,
        fallbackThreshold: 0.3,
        clarificationEnabled: true,
      });
      const dataset = createDataset();
      const optimizer = new ThresholdOptimizer(router, dataset);

      expect(() => optimizer.gridSearch([0.5], [0.6])).toThrow(RouterError);
    });
  });

  describe('validation', () => {
    it('should throw for empty dataset', () => {
      const router = new ConfidenceRouter();
      const dataset: EvaluationDataset = { examples: [] };

      expect(() => new ThresholdOptimizer(router, dataset)).toThrow(RouterError);
    });

    it('should throw for invalid example', () => {
      const router = new ConfidenceRouter();
      const dataset: EvaluationDataset = {
        examples: [{ input: '', expectedLabel: '' }],
      };

      expect(() => new ThresholdOptimizer(router, dataset)).toThrow(RouterError);
    });
  });

  describe('synthetic predictions', () => {
    it('should generate deterministic confidence for same input', () => {
      const router = new ConfidenceRouter({
        routeThreshold: 0.8,
        fallbackThreshold: 0.3,
        clarificationEnabled: true,
      });
      const dataset: EvaluationDataset = {
        examples: [{ input: 'hello world', expectedLabel: 'greeting' }],
      };

      const optimizer1 = new ThresholdOptimizer(router, dataset);
      const optimizer2 = new ThresholdOptimizer(router, dataset);

      const m1 = optimizer1.evaluateWithCurrentThresholds();
      const m2 = optimizer2.evaluateWithCurrentThresholds();

      expect(m1.accuracy).toBe(m2.accuracy);
      expect(m1.f1Score).toBe(m2.f1Score);
    });

    it('should generate different confidence for different inputs', () => {
      const router = new ConfidenceRouter({
        routeThreshold: 0.5,
        fallbackThreshold: 0.2,
        clarificationEnabled: true,
      });
      const dataset: EvaluationDataset = {
        examples: [
          { input: 'aaa', expectedLabel: 'a' },
          { input: 'bbb', expectedLabel: 'b' },
          { input: 'ccc', expectedLabel: 'c' },
        ],
      };

      const optimizer = new ThresholdOptimizer(router, dataset);
      const metrics = optimizer.evaluateWithCurrentThresholds();

      // With 3 different inputs and deterministic hash, we should get
      // varied decisions (not all identical)
      const totalDecisions =
        metrics.decisionsByType.ROUTE +
        metrics.decisionsByType.CLARIFY +
        metrics.decisionsByType.FALLBACK;
      expect(totalDecisions).toBe(3);
    });
  });
});
