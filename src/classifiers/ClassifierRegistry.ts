import type { ClassificationResult, Classifier } from '../types/index.js';
import { RouterError, RouterErrorType } from '../types/errors.js';

/**
 * Registry for pluggable classifiers with support for named lookup
 * and prioritized fallback chains.
 */
export class ClassifierRegistry {
  private classifiers: Map<string, Classifier> = new Map();
  private defaultClassifier: string | null = null;

  /**
   * Registers a classifier. The first enabled classifier registered
   * becomes the default.
   *
   * @param classifier - The classifier to register
   */
  register(classifier: Classifier): void {
    this.classifiers.set(classifier.name, classifier);

    if (classifier.enabled && !this.defaultClassifier) {
      this.defaultClassifier = classifier.name;
    }
  }

  /**
   * Retrieves a registered classifier by name.
   *
   * @param name - The classifier name
   * @returns The classifier, or undefined if not found
   */
  get(name: string): Classifier | undefined {
    return this.classifiers.get(name);
  }

  /**
   * Classifies input using the specified classifier, or the default
   * classifier if no name is provided.
   *
   * @param input - The text to classify
   * @param classifierName - Optional specific classifier name
   * @returns The classification result
   * @throws {RouterError} If no classifier is found
   */
  async classify(
    input: string,
    classifierName?: string,
    context?: Record<string, unknown>
  ): Promise<ClassificationResult> {
    const name = classifierName || this.defaultClassifier;

    if (!name) {
      throw new RouterError(
        RouterErrorType.CLASSIFIER_NOT_FOUND,
        'No classifier registered and no default classifier set'
      );
    }

    const classifier = this.classifiers.get(name);

    if (!classifier) {
      throw new RouterError(RouterErrorType.CLASSIFIER_NOT_FOUND, `Classifier "${name}" not found`);
    }

    return classifier.classify(input, context);
  }

  /**
   * Attempts classification through all enabled classifiers in priority order,
   * returning the first successful result.
   *
   * @param input - The text to classify
   * @returns The classification result from the first successful classifier
   * @throws {RouterError} If all classifiers in the chain fail
   */
  async getFallbackChain(input: string): Promise<ClassificationResult> {
    const sortedClassifiers = Array.from(this.classifiers.values())
      .filter((c) => c.enabled)
      .sort((a, b) => a.priority - b.priority);

    const errors: Array<{ classifier: string; error: string }> = [];

    for (const classifier of sortedClassifiers) {
      try {
        return await classifier.classify(input);
      } catch (err) {
        errors.push({
          classifier: classifier.name,
          error: err instanceof Error ? err.message : String(err),
        });
        continue;
      }
    }

    throw new RouterError(
      RouterErrorType.CLASSIFIER_NOT_FOUND,
      'All classifiers in fallback chain failed',
      { attempts: errors }
    );
  }
}
