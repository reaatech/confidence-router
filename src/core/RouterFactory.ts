import type { RouterConfig } from '../types/index.js';
import { ConfidenceRouter } from './ConfidenceRouter.js';

/**
 * Factory for creating pre-configured ConfidenceRouter instances.
 */
export class RouterFactory {
  /**
   * Creates a ConfidenceRouter with the given partial configuration.
   * Missing fields use defaults.
   */
  static create(config?: Partial<RouterConfig>): ConfidenceRouter {
    return new ConfidenceRouter(config);
  }

  /**
   * Creates a ConfidenceRouter with all default settings.
   */
  static createWithDefaults(): ConfidenceRouter {
    return new ConfidenceRouter();
  }
}
