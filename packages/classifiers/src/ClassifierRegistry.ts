import type { ClassificationResult, Classifier } from '@reaatech/confidence-router-core';
import { RouterError, RouterErrorType } from '@reaatech/confidence-router-core';

export class ClassifierRegistry {
  private classifiers: Map<string, Classifier> = new Map();
  private defaultClassifier: string | null = null;

  register(classifier: Classifier): void {
    this.classifiers.set(classifier.name, classifier);

    if (classifier.enabled && !this.defaultClassifier) {
      this.defaultClassifier = classifier.name;
    }
  }

  get(name: string): Classifier | undefined {
    return this.classifiers.get(name);
  }

  async classify(
    input: string,
    classifierName?: string,
    context?: Record<string, unknown>,
  ): Promise<ClassificationResult> {
    const name = classifierName || this.defaultClassifier;

    if (!name) {
      throw new RouterError(
        RouterErrorType.CLASSIFIER_NOT_FOUND,
        'No classifier registered and no default classifier set',
      );
    }

    const classifier = this.classifiers.get(name);

    if (!classifier) {
      throw new RouterError(RouterErrorType.CLASSIFIER_NOT_FOUND, `Classifier "${name}" not found`);
    }

    return classifier.classify(input, context);
  }

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
      }
    }

    throw new RouterError(
      RouterErrorType.CLASSIFIER_NOT_FOUND,
      'All classifiers in fallback chain failed',
      { attempts: errors },
    );
  }
}
