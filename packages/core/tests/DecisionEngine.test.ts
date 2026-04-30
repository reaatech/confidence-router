import { beforeEach, describe, expect, it } from 'vitest';
import { DecisionEngine } from '../src/DecisionEngine.js';
import { RouterError } from '../src/types/errors.js';
import type { ClassificationResult, RouterConfig } from '../src/types/index.js';

describe('DecisionEngine', () => {
  let engine: DecisionEngine;

  const createConfig = (overrides?: Partial<RouterConfig>): RouterConfig => ({
    routeThreshold: 0.8,
    fallbackThreshold: 0.3,
    clarificationEnabled: true,
    ...overrides,
  });

  beforeEach(() => {
    engine = new DecisionEngine(createConfig());
  });

  describe('decide', () => {
    it('should route when confidence exceeds route threshold', () => {
      const classification: ClassificationResult = {
        predictions: [
          { label: 'intent_a', confidence: 0.9 },
          { label: 'intent_b', confidence: 0.1 },
        ],
      };

      const decision = engine.decide(classification);

      expect(decision.type).toBe('ROUTE');
      expect(decision.target).toBe('intent_a');
      expect(decision.confidence).toBe(0.9);
    });

    it('should route when confidence equals route threshold', () => {
      const classification: ClassificationResult = {
        predictions: [
          { label: 'intent_a', confidence: 0.8 },
          { label: 'intent_b', confidence: 0.2 },
        ],
      };

      const decision = engine.decide(classification);

      expect(decision.type).toBe('ROUTE');
    });

    it('should clarify when confidence is in uncertainty zone', () => {
      const classification: ClassificationResult = {
        predictions: [
          { label: 'intent_a', confidence: 0.6 },
          { label: 'intent_b', confidence: 0.4 },
        ],
      };

      const decision = engine.decide(classification);

      expect(decision.type).toBe('CLARIFY');
      expect(decision.confidence).toBe(0.6);
      expect(decision.options).toContain('intent_a');
      expect(decision.options).toContain('intent_b');
    });

    it('should fallback when confidence is below fallback threshold', () => {
      const classification: ClassificationResult = {
        predictions: [
          { label: 'intent_a', confidence: 0.2 },
          { label: 'intent_b', confidence: 0.15 },
        ],
      };

      const decision = engine.decide(classification);

      expect(decision.type).toBe('FALLBACK');
      expect(decision.confidence).toBe(0.2);
    });

    it('should clarify when confidence equals fallback threshold', () => {
      const classification: ClassificationResult = {
        predictions: [
          { label: 'intent_a', confidence: 0.3 },
          { label: 'intent_b', confidence: 0.15 },
        ],
      };

      const decision = engine.decide(classification);

      expect(decision.type).toBe('CLARIFY');
    });

    it('should fallback instead of clarify when clarification is disabled', () => {
      engine = new DecisionEngine(createConfig({ clarificationEnabled: false }));

      const classification: ClassificationResult = {
        predictions: [
          { label: 'intent_a', confidence: 0.5 },
          { label: 'intent_b', confidence: 0.3 },
        ],
      };

      const decision = engine.decide(classification);

      expect(decision.type).toBe('FALLBACK');
    });

    it('should select top prediction when unsorted', () => {
      const classification: ClassificationResult = {
        predictions: [
          { label: 'intent_b', confidence: 0.3 },
          { label: 'intent_a', confidence: 0.9 },
          { label: 'intent_c', confidence: 0.1 },
        ],
      };

      const decision = engine.decide(classification);

      expect(decision.type).toBe('ROUTE');
      expect(decision.target).toBe('intent_a');
    });

    it('should limit clarification options to maxClarificationOptions', () => {
      engine = new DecisionEngine(createConfig({ maxClarificationOptions: 2 }));

      const classification: ClassificationResult = {
        predictions: [
          { label: 'intent_a', confidence: 0.5 },
          { label: 'intent_b', confidence: 0.3 },
          { label: 'intent_c', confidence: 0.2 },
        ],
      };

      const decision = engine.decide(classification);

      expect(decision.type).toBe('CLARIFY');
      expect(decision.options).toHaveLength(2);
    });
  });

  describe('input validation', () => {
    it('should throw for empty predictions array', () => {
      expect(() => engine.decide({ predictions: [] })).toThrow(RouterError);
    });

    it('should throw for invalid confidence values', () => {
      const classification: ClassificationResult = {
        predictions: [{ label: 'intent_a', confidence: 1.5 }],
      };

      expect(() => engine.decide(classification)).toThrow(RouterError);
    });

    it('should throw for negative confidence values', () => {
      const classification: ClassificationResult = {
        predictions: [{ label: 'intent_a', confidence: -0.1 }],
      };

      expect(() => engine.decide(classification)).toThrow(RouterError);
    });

    it('should throw for missing label', () => {
      const classification = {
        predictions: [{ confidence: 0.9 }],
      } as ClassificationResult;

      expect(() => engine.decide(classification)).toThrow(RouterError);
    });

    it('should throw for null classification', () => {
      expect(() => engine.decide(null as unknown as ClassificationResult)).toThrow(RouterError);
    });
  });

  describe('evaluateThresholds', () => {
    it('should return ROUTE for high confidence', () => {
      expect(engine.evaluateThresholds(0.9)).toBe('ROUTE');
    });

    it('should return CLARIFY for medium confidence', () => {
      expect(engine.evaluateThresholds(0.5)).toBe('CLARIFY');
    });

    it('should return FALLBACK for low confidence', () => {
      expect(engine.evaluateThresholds(0.1)).toBe('FALLBACK');
    });
  });
});
