import { describe, it, expect } from 'vitest';
import { ConfidenceRouter } from '../../src/core/ConfidenceRouter.js';
import type { ClassificationResult, Classifier } from '../../src/types/index.js';

describe('ConfidenceRouter', () => {
  const createRouter = (overrides?: ConstructorParameters<typeof ConfidenceRouter>[0]) =>
    new ConfidenceRouter({
      routeThreshold: 0.8,
      fallbackThreshold: 0.3,
      clarificationEnabled: true,
      ...overrides,
    });

  describe('decide', () => {
    it('should route high confidence classification', () => {
      const router = createRouter();
      const classification: ClassificationResult = {
        predictions: [
          { label: 'book_flight', confidence: 0.9 },
          { label: 'check_status', confidence: 0.1 },
        ],
      };

      const decision = router.decide(classification);

      expect(decision.type).toBe('ROUTE');
      expect(decision.target).toBe('book_flight');
    });

    it('should generate clarification prompt for medium confidence', () => {
      const router = createRouter();
      const classification: ClassificationResult = {
        predictions: [
          { label: 'book_flight', confidence: 0.6 },
          { label: 'check_status', confidence: 0.4 },
        ],
      };

      const decision = router.decide(classification);

      expect(decision.type).toBe('CLARIFY');
      expect(decision.prompt).toContain('book_flight');
      expect(decision.prompt).toContain('check_status');
    });

    it('should use fallback handler when configured', () => {
      const fallbackHandler = () => ({
        type: 'FALLBACK' as const,
        target: 'default_handler',
      });

      const router = createRouter({ fallbackHandler });
      const classification: ClassificationResult = {
        predictions: [
          { label: 'book_flight', confidence: 0.2 },
          { label: 'check_status', confidence: 0.1 },
        ],
      };

      const decision = router.decide(classification);

      expect(decision.type).toBe('FALLBACK');
      expect(decision.target).toBe('default_handler');
    });
  });

  describe('decideBatch', () => {
    it('should process multiple classifications', () => {
      const router = createRouter();
      const classifications: ClassificationResult[] = [
        {
          predictions: [
            { label: 'intent_a', confidence: 0.9 },
            { label: 'intent_b', confidence: 0.1 },
          ],
        },
        {
          predictions: [
            { label: 'intent_c', confidence: 0.2 },
            { label: 'intent_d', confidence: 0.1 },
          ],
        },
      ];

      const decisions = router.decideBatch(classifications);

      expect(decisions).toHaveLength(2);
      expect(decisions[0].type).toBe('ROUTE');
      expect(decisions[1].type).toBe('FALLBACK');
    });
  });

  describe('updateConfig', () => {
    it('should update configuration dynamically', () => {
      const router = createRouter({ routeThreshold: 0.8 });

      router.updateConfig({ routeThreshold: 0.9 });

      expect(router.getConfig().routeThreshold).toBe(0.9);
    });

    it('should validate new configuration', () => {
      const router = createRouter();

      expect(() => router.updateConfig({ routeThreshold: 0.2, fallbackThreshold: 0.5 })).toThrow();
    });
  });

  describe('classifier registration', () => {
    it('should register and retrieve classifier', () => {
      const router = createRouter();
      const classifier: Classifier = {
        name: 'test-classifier',
        type: 'custom',
        enabled: true,
        priority: 1,
        classify: async () => ({
          predictions: [{ label: 'test', confidence: 0.9 }],
        }),
      };

      router.registerClassifier(classifier);

      expect(router.getClassifier('test-classifier')).toBe(classifier);
    });

    it('should classify input using registered classifier', async () => {
      const router = createRouter();
      const classifier: Classifier = {
        name: 'test-classifier',
        type: 'custom',
        enabled: true,
        priority: 1,
        classify: async () => ({
          predictions: [{ label: 'test', confidence: 0.9 }],
        }),
      };

      router.registerClassifier(classifier);
      const result = await router.classify('hello');

      expect(result.predictions[0].label).toBe('test');
    });
  });

  describe('multi-language clarification', () => {
    it('should generate Spanish clarification prompt', () => {
      const router = createRouter({
        clarificationLanguages: ['es'],
      });
      const classification: ClassificationResult = {
        predictions: [
          { label: 'vuelo', confidence: 0.6 },
          { label: 'hotel', confidence: 0.4 },
        ],
      };

      const decision = router.decide(classification);

      expect(decision.type).toBe('CLARIFY');
      expect(decision.prompt).toContain('¿Quisiste decir');
    });

    it('should generate Japanese clarification prompt', () => {
      const router = createRouter({
        clarificationLanguages: ['ja'],
      });
      const classification: ClassificationResult = {
        predictions: [
          { label: '予約', confidence: 0.6 },
          { label: 'キャンセル', confidence: 0.4 },
        ],
      };

      const decision = router.decide(classification);

      expect(decision.type).toBe('CLARIFY');
      expect(decision.prompt).toContain('のことですか');
    });
  });
});
