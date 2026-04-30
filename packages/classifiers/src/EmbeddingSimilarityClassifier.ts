import type {
  ClassificationResult,
  Classifier,
  Prediction,
} from '@reaatech/confidence-router-core';
import { RouterError, RouterErrorType } from '@reaatech/confidence-router-core';

export interface ReferenceVector {
  label: string;
  vector: number[];
}

export type EmbeddingProvider = (input: string) => Promise<number[]> | number[];

export interface EmbeddingSimilarityClassifierOptions {
  name?: string;
  priority?: number;
  enabled?: boolean;
  embeddingProvider?: EmbeddingProvider;
}

export class EmbeddingSimilarityClassifier implements Classifier {
  name: string;
  type = 'embedding';
  enabled: boolean;
  priority: number;
  private embeddingProvider?: EmbeddingProvider;

  constructor(
    private references: ReferenceVector[],
    options: EmbeddingSimilarityClassifierOptions = {},
  ) {
    this.name = options.name ?? 'embedding';
    this.priority = options.priority ?? 1;
    this.enabled = options.enabled ?? true;
    this.embeddingProvider = options.embeddingProvider;
    this.validateReferences();
  }

  async classify(input: string, context?: Record<string, unknown>): Promise<ClassificationResult> {
    const provider =
      (context?.embeddingProvider as EmbeddingProvider | undefined) ?? this.embeddingProvider;

    if (!provider || typeof provider !== 'function') {
      throw new RouterError(
        RouterErrorType.CONFIGURATION_ERROR,
        'EmbeddingSimilarityClassifier requires an embeddingProvider function (constructor or context)',
      );
    }

    const inputVector = await provider(input);
    this.validateVector(inputVector, 'input embedding');

    const predictions: Prediction[] = [];

    for (const ref of this.references) {
      const similarity = this.cosineSimilarity(inputVector, ref.vector);
      const confidence = Math.max(0, similarity);

      predictions.push({
        label: ref.label,
        confidence,
        metadata: {
          similarity,
          vectorDimension: ref.vector.length,
        },
      });
    }

    predictions.sort((a, b) => b.confidence - a.confidence);

    return {
      predictions,
      metadata: {
        classifier: this.name,
        type: this.type,
        inputDimension: inputVector.length,
      },
    };
  }

  async validate(): Promise<boolean> {
    this.validateReferences();
    return true;
  }

  private validateReferences(): void {
    if (!this.references || this.references.length === 0) {
      throw new RouterError(
        RouterErrorType.CONFIGURATION_ERROR,
        'EmbeddingSimilarityClassifier requires at least one reference vector',
      );
    }

    const expectedDim = this.references[0].vector.length;
    if (expectedDim === 0) {
      throw new RouterError(
        RouterErrorType.CONFIGURATION_ERROR,
        'Reference vectors must not be empty',
      );
    }

    const seenLabels = new Set<string>();

    for (const ref of this.references) {
      if (!ref.label || typeof ref.label !== 'string') {
        throw new RouterError(
          RouterErrorType.CONFIGURATION_ERROR,
          'Each reference must have a non-empty label',
        );
      }

      if (seenLabels.has(ref.label)) {
        throw new RouterError(
          RouterErrorType.CONFIGURATION_ERROR,
          `Duplicate reference label: ${ref.label}`,
        );
      }
      seenLabels.add(ref.label);

      this.validateVector(ref.vector, `reference "${ref.label}"`);

      if (ref.vector.length !== expectedDim) {
        throw new RouterError(
          RouterErrorType.CONFIGURATION_ERROR,
          `Reference "${ref.label}" has dimension ${ref.vector.length}, expected ${expectedDim}`,
        );
      }
    }
  }

  private validateVector(vec: number[], description: string): void {
    if (!Array.isArray(vec) || vec.length === 0) {
      throw new RouterError(
        RouterErrorType.CLASSIFICATION_ERROR,
        `Invalid vector for ${description}: must be a non-empty number array`,
      );
    }

    for (let i = 0; i < vec.length; i++) {
      if (typeof vec[i] !== 'number' || !Number.isFinite(vec[i])) {
        throw new RouterError(
          RouterErrorType.CLASSIFICATION_ERROR,
          `Invalid value in ${description} vector at index ${i}: ${vec[i]}`,
        );
      }
    }
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    if (normA === 0 || normB === 0) {
      return 0;
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}
