import { describe, it, expect } from 'vitest';
import { validateConfig, mergeConfig, DEFAULT_CONFIG } from '../../src/config/index.js';
import { RouterError } from '../../src/types/errors.js';
import type { RouterConfig } from '../../src/types/index.js';

describe('config', () => {
  describe('validateConfig', () => {
    it('should pass for valid config', () => {
      const config: RouterConfig = {
        routeThreshold: 0.8,
        fallbackThreshold: 0.3,
        clarificationEnabled: true,
      };

      expect(() => validateConfig(config)).not.toThrow();
    });

    it('should throw when fallbackThreshold >= routeThreshold', () => {
      const config: RouterConfig = {
        routeThreshold: 0.5,
        fallbackThreshold: 0.5,
        clarificationEnabled: true,
      };

      expect(() => validateConfig(config)).toThrow(RouterError);
      expect(() => validateConfig(config)).toThrow('must be strictly less than');
    });

    it('should throw when fallbackThreshold > routeThreshold', () => {
      const config: RouterConfig = {
        routeThreshold: 0.3,
        fallbackThreshold: 0.5,
        clarificationEnabled: true,
      };

      expect(() => validateConfig(config)).toThrow(RouterError);
    });

    it('should throw when routeThreshold is above 1', () => {
      const config: RouterConfig = {
        routeThreshold: 1.1,
        fallbackThreshold: 0.3,
        clarificationEnabled: true,
      };

      expect(() => validateConfig(config)).toThrow(RouterError);
    });

    it('should throw when routeThreshold is below 0', () => {
      const config: RouterConfig = {
        routeThreshold: -0.1,
        fallbackThreshold: -0.2,
        clarificationEnabled: true,
      };

      expect(() => validateConfig(config)).toThrow(RouterError);
    });

    it('should throw when maxClarificationOptions is less than 2', () => {
      const config: RouterConfig = {
        routeThreshold: 0.8,
        fallbackThreshold: 0.3,
        clarificationEnabled: true,
        maxClarificationOptions: 1,
      };

      expect(() => validateConfig(config)).toThrow(RouterError);
    });

    it('should pass when maxClarificationOptions is 2 or more', () => {
      const config: RouterConfig = {
        routeThreshold: 0.8,
        fallbackThreshold: 0.3,
        clarificationEnabled: true,
        maxClarificationOptions: 2,
      };

      expect(() => validateConfig(config)).not.toThrow();
    });

    it('should throw when routeThreshold is exactly 0 and fallbackThreshold is negative', () => {
      const config: RouterConfig = {
        routeThreshold: 0,
        fallbackThreshold: -0.1,
        clarificationEnabled: true,
      };

      expect(() => validateConfig(config)).toThrow(RouterError);
    });

    it('should pass when routeThreshold is exactly 1 and fallbackThreshold is valid', () => {
      // routeThreshold=1 is technically valid per validation, but fallback must be < 1
      const config: RouterConfig = {
        routeThreshold: 1,
        fallbackThreshold: 0.5,
        clarificationEnabled: true,
      };

      expect(() => validateConfig(config)).not.toThrow();
    });

    it('should throw when routeThreshold is above 1', () => {
      const config: RouterConfig = {
        routeThreshold: 1.01,
        fallbackThreshold: 0.5,
        clarificationEnabled: true,
      };

      expect(() => validateConfig(config)).toThrow(RouterError);
    });

    it('should throw when fallbackThreshold is below 0', () => {
      const config: RouterConfig = {
        routeThreshold: 0.5,
        fallbackThreshold: -0.01,
        clarificationEnabled: true,
      };

      expect(() => validateConfig(config)).toThrow(RouterError);
    });

    it('should pass for boundary thresholds', () => {
      const config: RouterConfig = {
        routeThreshold: 0.99,
        fallbackThreshold: 0.01,
        clarificationEnabled: true,
      };

      expect(() => validateConfig(config)).not.toThrow();
    });
  });

  describe('mergeConfig', () => {
    it('should return defaults when no partial config provided', () => {
      const config = mergeConfig();

      expect(config.routeThreshold).toBe(DEFAULT_CONFIG.routeThreshold);
      expect(config.fallbackThreshold).toBe(DEFAULT_CONFIG.fallbackThreshold);
    });

    it('should override defaults with partial config', () => {
      const config = mergeConfig({ routeThreshold: 0.9 });

      expect(config.routeThreshold).toBe(0.9);
      expect(config.fallbackThreshold).toBe(DEFAULT_CONFIG.fallbackThreshold);
    });
  });
});
