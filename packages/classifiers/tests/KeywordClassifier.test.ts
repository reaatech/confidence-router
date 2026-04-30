import { RouterError } from '@reaatech/confidence-router-core';
import { describe, expect, it } from 'vitest';
import { KeywordClassifier } from '../src/index.js';

describe('KeywordClassifier', () => {
  it('classifies input based on substring matches', async () => {
    const classifier = new KeywordClassifier([
      { label: 'book_flight', keywords: ['flight', 'fly', 'ticket'] },
      { label: 'check_status', keywords: ['status', 'where', 'track'] },
    ]);

    const result = await classifier.classify('I want to book a flight and check the status');

    expect(result.predictions).toHaveLength(2);
    expect(result.predictions[0].label).toBe('book_flight');
    expect(result.predictions[0].confidence).toBeCloseTo(1 / 3, 5);
  });

  it('returns only matching labels', async () => {
    const classifier = new KeywordClassifier([
      { label: 'a', keywords: ['alpha'] },
      { label: 'b', keywords: ['beta'] },
    ]);

    const result = await classifier.classify('alpha test');

    expect(result.predictions).toHaveLength(1);
    expect(result.predictions[0].label).toBe('a');
  });

  it('sorts predictions by confidence descending', async () => {
    const classifier = new KeywordClassifier([
      { label: 'two_matches', keywords: ['a', 'b'] },
      { label: 'one_match', keywords: ['a', 'c'] },
    ]);

    const result = await classifier.classify('a b');

    expect(result.predictions[0].label).toBe('two_matches');
    expect(result.predictions[1].label).toBe('one_match');
    expect(result.predictions[0].confidence).toBeGreaterThan(result.predictions[1].confidence);
  });

  it('supports exact word matching', async () => {
    const classifier = new KeywordClassifier([
      { label: 'fly', keywords: ['fly'], mode: 'exact' },
      { label: 'flight', keywords: ['flight'], mode: 'exact' },
    ]);

    const result = await classifier.classify('I want to fly');

    expect(result.predictions[0].label).toBe('fly');
    expect(result.predictions).toHaveLength(1);
  });

  it('does not match substring in exact mode', async () => {
    const classifier = new KeywordClassifier([{ label: 'fly', keywords: ['fly'], mode: 'exact' }]);

    const result = await classifier.classify('I want to buy butterfly');

    expect(result.predictions).toHaveLength(0);
  });

  it('supports regex matching', async () => {
    const classifier = new KeywordClassifier([
      { label: 'date', keywords: ['\\d{4}-\\d{2}-\\d{2}'], mode: 'regex' },
    ]);

    const result = await classifier.classify('My travel date is 2024-12-25');

    expect(result.predictions).toHaveLength(1);
    expect(result.predictions[0].label).toBe('date');
  });

  it('applies weight multiplier to confidence', async () => {
    const classifier = new KeywordClassifier([
      { label: 'weighted', keywords: ['a', 'b'], weight: 2 },
      { label: 'normal', keywords: ['a', 'b'] },
    ]);

    const result = await classifier.classify('a');

    expect(result.predictions[0].label).toBe('weighted');
    expect(result.predictions[0].confidence).toBe(1); // 0.5 * 2 = 1, capped
    expect(result.predictions[1].confidence).toBe(0.5); // 0.5 * 1 = 0.5
  });

  it('caps confidence at 1 even with high weight', async () => {
    const classifier = new KeywordClassifier([{ label: 'heavy', keywords: ['a'], weight: 10 }]);

    const result = await classifier.classify('a');

    expect(result.predictions[0].confidence).toBe(1);
  });

  it('is case-insensitive by default', async () => {
    const classifier = new KeywordClassifier([{ label: 'test', keywords: ['FLIGHT'] }]);

    const result = await classifier.classify('book a flight');

    expect(result.predictions).toHaveLength(1);
  });

  it('respects caseSensitive option', async () => {
    const classifier = new KeywordClassifier([{ label: 'test', keywords: ['FLIGHT'] }], {
      caseSensitive: true,
    });

    const result = await classifier.classify('book a flight');

    expect(result.predictions).toHaveLength(0);
  });

  it('throws on empty patterns', () => {
    expect(() => new KeywordClassifier([])).toThrow(RouterError);
    expect(() => new KeywordClassifier([])).toThrow('requires at least one pattern');
  });

  it('throws on duplicate labels', () => {
    expect(
      () =>
        new KeywordClassifier([
          { label: 'dup', keywords: ['a'] },
          { label: 'dup', keywords: ['b'] },
        ]),
    ).toThrow(RouterError);
  });

  it('throws on empty keywords', () => {
    expect(() => new KeywordClassifier([{ label: 'bad', keywords: [] }])).toThrow(
      'must have at least one keyword',
    );
  });

  it('throws on empty keyword string', () => {
    expect(() => new KeywordClassifier([{ label: 'bad', keywords: [''] }])).toThrow(
      'non-empty strings',
    );
  });

  it('returns matched keywords with caseSensitive true', async () => {
    const classifier = new KeywordClassifier([{ label: 'test', keywords: ['Flight'] }], {
      caseSensitive: true,
    });

    const result = await classifier.classify('book a Flight');

    expect(result.predictions).toHaveLength(1);
    expect(result.predictions[0].metadata?.matchedKeywords).toEqual(['Flight']);
  });

  it('throws on invalid regex in regex mode', () => {
    expect(
      () => new KeywordClassifier([{ label: 'bad', keywords: ['[invalid'], mode: 'regex' }]),
    ).toThrow('Invalid regex');
  });

  it('exposes name, type, enabled, and priority', () => {
    const classifier = new KeywordClassifier([{ label: 'a', keywords: ['x'] }], {
      name: 'my-keywords',
      priority: 5,
      enabled: false,
    });

    expect(classifier.name).toBe('my-keywords');
    expect(classifier.type).toBe('keyword');
    expect(classifier.priority).toBe(5);
    expect(classifier.enabled).toBe(false);
  });

  it('validate resolves to true for valid classifier', async () => {
    const classifier = new KeywordClassifier([{ label: 'a', keywords: ['x'] }]);
    await expect(classifier.validate()).resolves.toBe(true);
  });

  it('includes metadata in classification result', async () => {
    const classifier = new KeywordClassifier([{ label: 'book', keywords: ['flight', 'ticket'] }]);

    const result = await classifier.classify('book a flight');

    expect(result.metadata?.classifier).toBe('keyword');
    expect(result.predictions[0].metadata?.matchedKeywords).toEqual(['flight']);
  });
});
