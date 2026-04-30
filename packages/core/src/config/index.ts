import { RouterError, RouterErrorType } from '../types/errors.js';
import type { RouterConfig } from '../types/index.js';

export const DEFAULT_CONFIG: RouterConfig = {
  routeThreshold: 0.8,
  fallbackThreshold: 0.3,
  clarificationEnabled: true,
  clarificationLanguages: ['en'],
  maxClarificationOptions: 3,
};

export function validateConfig(config: RouterConfig): void {
  if (config.fallbackThreshold >= config.routeThreshold) {
    throw new RouterError(
      RouterErrorType.THRESHOLD_INVALID,
      `fallbackThreshold (${config.fallbackThreshold}) must be strictly less than routeThreshold (${config.routeThreshold})`,
    );
  }

  if (config.routeThreshold < 0 || config.routeThreshold > 1) {
    throw new RouterError(
      RouterErrorType.THRESHOLD_INVALID,
      `routeThreshold (${config.routeThreshold}) must be between 0 and 1`,
    );
  }

  if (config.fallbackThreshold < 0 || config.fallbackThreshold > 1) {
    throw new RouterError(
      RouterErrorType.THRESHOLD_INVALID,
      `fallbackThreshold (${config.fallbackThreshold}) must be between 0 and 1`,
    );
  }

  if (config.maxClarificationOptions !== undefined && config.maxClarificationOptions < 2) {
    throw new RouterError(
      RouterErrorType.CONFIGURATION_ERROR,
      'maxClarificationOptions must be at least 2',
    );
  }
}

export function mergeConfig(partial?: Partial<RouterConfig>): RouterConfig {
  return {
    ...DEFAULT_CONFIG,
    ...partial,
  };
}
