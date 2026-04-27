import { describe, it, expect } from 'vitest';

// Barrel-import sanity test to cover src/index.ts exports
describe('public API exports', () => {
  it('should export all public symbols', async () => {
    const mod = await import('../../src/index.js');

    expect(mod.ConfidenceRouter).toBeDefined();
    expect(mod.DecisionEngine).toBeDefined();
    expect(mod.RouterError).toBeDefined();
    expect(mod.RouterErrorType).toBeDefined();
    expect(mod.DEFAULT_CONFIG).toBeDefined();
    expect(mod.validateConfig).toBeDefined();
    expect(mod.mergeConfig).toBeDefined();
    expect(mod.LanguageManager).toBeDefined();
    expect(mod.PromptGenerator).toBeDefined();
    expect(mod.ClassifierRegistry).toBeDefined();
    expect(mod.ThresholdOptimizer).toBeDefined();
    expect(mod.KeywordClassifier).toBeDefined();
    expect(mod.EmbeddingSimilarityClassifier).toBeDefined();
    expect(mod.LLMClassifier).toBeDefined();
    expect(mod.RouterFactory).toBeDefined();
  });
});
