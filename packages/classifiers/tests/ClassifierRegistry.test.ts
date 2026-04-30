import { RouterError } from '@reaatech/confidence-router-core';
import type { ClassificationResult, Classifier } from '@reaatech/confidence-router-core';
import { describe, expect, it } from 'vitest';
import { ClassifierRegistry } from '../src/ClassifierRegistry.js';

describe('ClassifierRegistry', () => {
  const createClassifier = (
    name: string,
    result: ClassificationResult,
    enabled = true,
    priority = 1,
  ): Classifier => ({
    name,
    type: 'custom',
    enabled,
    priority,
    classify: async () => result,
  });

  it('should register and classify with default classifier', async () => {
    const registry = new ClassifierRegistry();
    const result: ClassificationResult = {
      predictions: [{ label: 'test', confidence: 0.9 }],
    };

    registry.register(createClassifier('default', result));
    const classification = await registry.classify('hello');

    expect(classification.predictions[0].label).toBe('test');
  });

  it('should classify with named classifier', async () => {
    const registry = new ClassifierRegistry();
    const resultA: ClassificationResult = {
      predictions: [{ label: 'a', confidence: 0.9 }],
    };
    const resultB: ClassificationResult = {
      predictions: [{ label: 'b', confidence: 0.9 }],
    };

    registry.register(createClassifier('classifier-a', resultA));
    registry.register(createClassifier('classifier-b', resultB));

    const classification = await registry.classify('hello', 'classifier-b');
    expect(classification.predictions[0].label).toBe('b');
  });

  it('should throw when classifier not found', async () => {
    const registry = new ClassifierRegistry();

    await expect(registry.classify('hello', 'missing')).rejects.toThrow(RouterError);
  });

  it('should throw when no classifiers registered', async () => {
    const registry = new ClassifierRegistry();

    await expect(registry.classify('hello')).rejects.toThrow('No classifier registered');
  });

  it('should use fallback chain when classifier fails', async () => {
    const registry = new ClassifierRegistry();
    const fallbackResult: ClassificationResult = {
      predictions: [{ label: 'fallback', confidence: 0.9 }],
    };

    const failingClassifier: Classifier = {
      name: 'failing',
      type: 'custom',
      enabled: true,
      priority: 1,
      classify: async () => {
        throw new Error('Classifier failed');
      },
    };

    registry.register(failingClassifier);
    registry.register(createClassifier('fallback', fallbackResult, true, 2));

    const result = await registry.getFallbackChain('hello');
    expect(result.predictions[0].label).toBe('fallback');
  });

  it('should skip disabled classifiers in fallback chain', async () => {
    const registry = new ClassifierRegistry();
    const result: ClassificationResult = {
      predictions: [{ label: 'active', confidence: 0.9 }],
    };

    registry.register(createClassifier('disabled', { predictions: [] }, false));
    registry.register(createClassifier('active', result, true, 2));

    const classification = await registry.getFallbackChain('hello');
    expect(classification.predictions[0].label).toBe('active');
  });

  it('should throw when all classifiers in fallback chain fail', async () => {
    const registry = new ClassifierRegistry();

    registry.register({
      name: 'failing1',
      type: 'custom',
      enabled: true,
      priority: 1,
      classify: async () => {
        throw new Error('fail 1');
      },
    });

    registry.register({
      name: 'failing2',
      type: 'custom',
      enabled: true,
      priority: 2,
      classify: async () => {
        throw new Error('fail 2');
      },
    });

    await expect(registry.getFallbackChain('hello')).rejects.toThrow(RouterError);
  });
});
