import { describe, it, expect } from 'vitest';
import { EmbeddingSimilarityClassifier, RouterError } from '../../src/index.js';

describe('EmbeddingSimilarityClassifier', () => {
  // Simple deterministic mock: map characters to numbers
  const makeVector = (input: string): number[] => {
    const vec = [0, 0, 0];
    for (let i = 0; i < input.length; i++) {
      vec[i % 3] += input.charCodeAt(i);
    }
    return vec;
  };
  // Suppress unused variable warning — makeVector is referenced indirectly
  void makeVector;

  it('classifies by cosine similarity', async () => {
    const classifier = new EmbeddingSimilarityClassifier(
      [
        { label: 'a', vector: [1, 0, 0] },
        { label: 'b', vector: [0, 1, 0] },
      ],
      { embeddingProvider: () => [1, 0, 0] }
    );

    const result = await classifier.classify('test');

    expect(result.predictions).toHaveLength(2);
    expect(result.predictions[0].label).toBe('a');
    expect(result.predictions[0].confidence).toBe(1);
  });

  it('sorts predictions by confidence descending', async () => {
    const classifier = new EmbeddingSimilarityClassifier(
      [
        { label: 'far', vector: [1, 0, 0] },
        { label: 'close', vector: [0.9, 0.1, 0] },
        { label: 'opposite', vector: [-1, 0, 0] },
      ],
      { embeddingProvider: () => [1, 0, 0] }
    );

    const result = await classifier.classify('x');

    expect(result.predictions[0].label).toBe('far');
    expect(result.predictions[1].label).toBe('close');
    expect(result.predictions[2].label).toBe('opposite');
    expect(result.predictions[2].confidence).toBe(0);
  });

  it('accepts embeddingProvider from context', async () => {
    const classifier = new EmbeddingSimilarityClassifier([{ label: 'a', vector: [1, 0, 0] }]);

    const result = await classifier.classify('test', {
      embeddingProvider: () => [1, 0, 0],
    });

    expect(result.predictions[0].confidence).toBe(1);
  });

  it('throws when no embeddingProvider is available', async () => {
    const classifier = new EmbeddingSimilarityClassifier([{ label: 'a', vector: [1, 0, 0] }]);

    await expect(classifier.classify('test')).rejects.toThrow(RouterError);
    await expect(classifier.classify('test')).rejects.toThrow('requires an embeddingProvider');
  });

  it('throws on empty references', () => {
    expect(() => new EmbeddingSimilarityClassifier([])).toThrow(RouterError);
    expect(() => new EmbeddingSimilarityClassifier([])).toThrow(
      'requires at least one reference vector'
    );
  });

  it('throws on duplicate labels', () => {
    expect(
      () =>
        new EmbeddingSimilarityClassifier([
          { label: 'dup', vector: [1, 0] },
          { label: 'dup', vector: [0, 1] },
        ])
    ).toThrow('Duplicate reference label');
  });

  it('throws on mismatched vector dimensions', () => {
    expect(
      () =>
        new EmbeddingSimilarityClassifier([
          { label: 'a', vector: [1, 0, 0] },
          { label: 'b', vector: [1, 0] },
        ])
    ).toThrow('expected 3');
  });

  it('throws on empty reference label', () => {
    expect(() => new EmbeddingSimilarityClassifier([{ label: '', vector: [1, 0] }])).toThrow(
      'non-empty label'
    );
  });

  it('throws on empty vectors', () => {
    expect(() => new EmbeddingSimilarityClassifier([{ label: 'a', vector: [] }])).toThrow(
      'must not be empty'
    );
  });

  it('throws on non-array vector from provider', async () => {
    const classifier = new EmbeddingSimilarityClassifier([{ label: 'a', vector: [1, 0] }], {
      embeddingProvider: () => 'not-an-array' as unknown as number[],
    });

    await expect(classifier.classify('x')).rejects.toThrow('must be a non-empty number array');
  });

  it('throws on invalid vector values from provider', async () => {
    const classifier = new EmbeddingSimilarityClassifier([{ label: 'a', vector: [1, 0] }], {
      embeddingProvider: () => [NaN, 0],
    });

    await expect(classifier.classify('x')).rejects.toThrow(
      'Invalid value in input embedding vector at index 0'
    );
  });

  it('returns zero confidence for zero vector input', async () => {
    const classifier = new EmbeddingSimilarityClassifier([{ label: 'a', vector: [1, 0, 0] }], {
      embeddingProvider: () => [0, 0, 0],
    });

    const result = await classifier.classify('x');

    expect(result.predictions[0].confidence).toBe(0);
  });

  it('exposes name, type, enabled, and priority', () => {
    const classifier = new EmbeddingSimilarityClassifier([{ label: 'a', vector: [1] }], {
      name: 'my-embed',
      priority: 3,
      enabled: false,
    });

    expect(classifier.name).toBe('my-embed');
    expect(classifier.type).toBe('embedding');
    expect(classifier.priority).toBe(3);
    expect(classifier.enabled).toBe(false);
  });

  it('validate resolves to true for valid classifier', async () => {
    const classifier = new EmbeddingSimilarityClassifier([{ label: 'a', vector: [1, 0] }]);
    await expect(classifier.validate()).resolves.toBe(true);
  });

  it('includes metadata in classification result', async () => {
    const classifier = new EmbeddingSimilarityClassifier([{ label: 'a', vector: [1, 0, 0] }], {
      embeddingProvider: () => [1, 0, 0],
    });

    const result = await classifier.classify('x');

    expect(result.metadata?.classifier).toBe('embedding');
    expect(result.metadata?.inputDimension).toBe(3);
    expect(result.predictions[0].metadata?.similarity).toBe(1);
  });
});
