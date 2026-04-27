import { describe, it, expect } from 'vitest';
import { DecisionEngine } from '../../src/core/DecisionEngine.js';
import type { ClassificationResult } from '../../src/types/index.js';

describe('DecisionEngine edge cases', () => {
  it('should handle single prediction', () => {
    const engine = new DecisionEngine({
      routeThreshold: 0.8,
      fallbackThreshold: 0.3,
      clarificationEnabled: true,
    });

    const classification: ClassificationResult = {
      predictions: [{ label: 'only_one', confidence: 0.9 }],
    };

    const decision = engine.decide(classification);
    expect(decision.type).toBe('ROUTE');
    expect(decision.target).toBe('only_one');
  });

  it('should handle predictions with same confidence', () => {
    const engine = new DecisionEngine({
      routeThreshold: 0.8,
      fallbackThreshold: 0.3,
      clarificationEnabled: true,
    });

    const classification: ClassificationResult = {
      predictions: [
        { label: 'first', confidence: 0.5 },
        { label: 'second', confidence: 0.5 },
      ],
    };

    const decision = engine.decide(classification);
    expect(decision.type).toBe('CLARIFY');
    expect(decision.options).toHaveLength(2);
  });

  it('should handle confidence of exactly 0', () => {
    const engine = new DecisionEngine({
      routeThreshold: 0.8,
      fallbackThreshold: 0.3,
      clarificationEnabled: true,
    });

    const classification: ClassificationResult = {
      predictions: [{ label: 'zero', confidence: 0 }],
    };

    const decision = engine.decide(classification);
    expect(decision.type).toBe('FALLBACK');
  });

  it('should handle confidence of exactly 1', () => {
    const engine = new DecisionEngine({
      routeThreshold: 0.8,
      fallbackThreshold: 0.3,
      clarificationEnabled: true,
    });

    const classification: ClassificationResult = {
      predictions: [{ label: 'perfect', confidence: 1 }],
    };

    const decision = engine.decide(classification);
    expect(decision.type).toBe('ROUTE');
  });

  it('should throw for unknown decision type via internal method', () => {
    const engine = new DecisionEngine({
      routeThreshold: 0.8,
      fallbackThreshold: 0.3,
      clarificationEnabled: true,
    });

    const classification: ClassificationResult = {
      predictions: [{ label: 'test', confidence: 0.5 }],
    };

    // Exercise the defensive default branch in createDecision via type assertion
    expect(() =>
      (
        engine as unknown as Record<
          string,
          (
            type: string,
            c: ClassificationResult,
            p: ClassificationResult['predictions'][0]
          ) => { type: string; confidence?: number }
        >
      ).createDecision('UNKNOWN', classification, classification.predictions[0])
    ).toThrow('Unexpected decision type: UNKNOWN');
  });
});
