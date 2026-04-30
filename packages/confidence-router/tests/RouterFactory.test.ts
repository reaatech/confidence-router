import { describe, expect, it } from 'vitest';
import { ConfidenceRouter, RouterFactory } from '../src/index.js';

describe('RouterFactory', () => {
  it('create returns a ConfidenceRouter', () => {
    const router = RouterFactory.create({ routeThreshold: 0.9 });
    expect(router).toBeInstanceOf(ConfidenceRouter);
    expect(router.getConfig().routeThreshold).toBe(0.9);
  });

  it('createWithDefaults returns a ConfidenceRouter with default config', () => {
    const router = RouterFactory.createWithDefaults();
    expect(router).toBeInstanceOf(ConfidenceRouter);
    expect(router.getConfig().routeThreshold).toBe(0.8);
    expect(router.getConfig().fallbackThreshold).toBe(0.3);
    expect(router.getConfig().clarificationEnabled).toBe(true);
  });
});
