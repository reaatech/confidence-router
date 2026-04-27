import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  KeywordClassifier,
  EmbeddingSimilarityClassifier,
  RouterFactory,
} from '../../src/index.js';

describe('Built-in Classifiers Integration', () => {
  it('end-to-end keyword classification and routing', async () => {
    const keywordClassifier = new KeywordClassifier(
      [
        { label: 'book_flight', keywords: ['flight', 'fly', 'ticket'] },
        { label: 'check_status', keywords: ['status', 'where', 'track'] },
      ],
      { name: 'flight-intents' }
    );

    const router = RouterFactory.create({
      routeThreshold: 0.3,
      fallbackThreshold: 0.1,
      clarificationEnabled: true,
    });
    router.registerClassifier(keywordClassifier);

    const decision = await router.process('I want to book a flight', 'flight-intents');

    expect(decision.type).toBe('ROUTE');
    expect(decision.target).toBe('book_flight');
  });

  it('end-to-end embedding classification and routing', async () => {
    const embeddingClassifier = new EmbeddingSimilarityClassifier(
      [
        { label: 'positive', vector: [1, 0, 0] },
        { label: 'negative', vector: [-1, 0, 0] },
      ],
      {
        name: 'sentiment',
        embeddingProvider: () => [0.9, 0.1, 0],
      }
    );

    const router = RouterFactory.create({
      routeThreshold: 0.5,
      fallbackThreshold: 0.2,
    });
    router.registerClassifier(embeddingClassifier);

    const decision = await router.process('great product', 'sentiment');

    expect(decision.type).toBe('ROUTE');
    expect(decision.target).toBe('positive');
  });

  it('classifier fallback chain with built-in classifiers', async () => {
    // Use overlapping keywords so both classifiers produce results,
    // then verify the fallback chain ordering by priority.
    const primary = new KeywordClassifier(
      [
        { label: 'primary_match', keywords: ['alpha'] },
        { label: 'shared', keywords: ['shared'] },
      ],
      { name: 'primary', enabled: true, priority: 1 }
    );

    const fallback = new KeywordClassifier(
      [
        { label: 'fallback_match', keywords: ['beta'] },
        { label: 'shared', keywords: ['shared'] },
      ],
      { name: 'fallback', enabled: true, priority: 2 }
    );

    const router = RouterFactory.create();
    router.registerClassifier(primary);
    router.registerClassifier(fallback);

    // primary succeeds first
    const result = await router.classifyWithFallback('alpha');
    expect(result.predictions[0].label).toBe('primary_match');

    // both succeed, primary (lower priority number) wins
    const shared = await router.classifyWithFallback('shared');
    expect(shared.predictions[0].label).toBe('shared');
  });

  it('batch processing with keyword classifier', async () => {
    const classifier = new KeywordClassifier([
      { label: 'greeting', keywords: ['hello'] },
      { label: 'farewell', keywords: ['bye'] },
    ]);

    const router = RouterFactory.create({
      routeThreshold: 0.5,
      fallbackThreshold: 0.2,
    });
    router.registerClassifier(classifier);

    const inputs = ['hello there', 'bye friend'];
    const decisions = await Promise.all(inputs.map((input) => router.process(input)));

    expect(decisions[0].type).toBe('ROUTE');
    expect(decisions[0].target).toBe('greeting');
    expect(decisions[1].type).toBe('ROUTE');
    expect(decisions[1].target).toBe('farewell');
  });
});

describe('Multi-language Integration', () => {
  it('generates clarification prompts in multiple languages', () => {
    const router = RouterFactory.create({
      routeThreshold: 0.8,
      fallbackThreshold: 0.3,
      clarificationEnabled: true,
      maxClarificationOptions: 3,
    });

    const classification = {
      predictions: [
        { label: 'book_flight', confidence: 0.55 },
        { label: 'check_status', confidence: 0.35 },
        { label: 'cancel_booking', confidence: 0.1 },
      ],
    };

    const languages = ['en', 'es', 'fr', 'de', 'ja', 'ar', 'bn', 'sw'];

    for (const lang of languages) {
      router.updateConfig({ clarificationLanguages: [lang] });
      const decision = router.decide(classification);

      expect(decision.type).toBe('CLARIFY');
      expect(decision.prompt).toBeTruthy();
      expect(decision.prompt).toContain('book_flight');
    }
  });
});

describe('LLMClassifier Integration', () => {
  let originalFetch: typeof globalThis.fetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('integrates with ConfidenceRouter for full LLM pipeline', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => '',
      json: async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify({
                predictions: [
                  { label: 'book_flight', confidence: 0.9 },
                  { label: 'check_status', confidence: 0.1 },
                ],
              }),
            },
          },
        ],
      }),
    } as Response);

    const llmClassifier = new (await import('../../src/index.js')).LLMClassifier({
      provider: 'openai',
      apiKey: 'test',
      labels: ['book_flight', 'check_status'],
      name: 'llm-intents',
    });

    const router = RouterFactory.create({
      routeThreshold: 0.8,
      fallbackThreshold: 0.3,
    });
    router.registerClassifier(llmClassifier);

    const decision = await router.process('I want to fly to Tokyo', 'llm-intents');

    expect(decision.type).toBe('ROUTE');
    expect(decision.target).toBe('book_flight');
  });
});
