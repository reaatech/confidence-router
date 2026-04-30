import type { RouterConfig } from '@reaatech/confidence-router-core';
import { ConfidenceRouter } from './ConfidenceRouter.js';

export function createRouter(config?: Partial<RouterConfig>): ConfidenceRouter {
  return new ConfidenceRouter(config);
}

export function createRouterWithDefaults(): ConfidenceRouter {
  return new ConfidenceRouter();
}

export const RouterFactory = {
  create: createRouter,
  createWithDefaults: createRouterWithDefaults,
};
