import type {
  ClassificationResult,
  Prediction,
  RoutingDecision,
  RouterConfig,
  DecisionType,
} from '../types/index.js';
import { RouterError, RouterErrorType } from '../types/errors.js';

/**
 * Core decision engine that evaluates classification confidence scores
 * against configurable thresholds to produce a routing decision.
 */
export class DecisionEngine {
  constructor(private config: RouterConfig) {}

  /**
   * Evaluates a classification result and returns a routing decision.
   *
   * @param classification - The classifier output with confidence scores
   * @returns A routing decision (ROUTE, CLARIFY, or FALLBACK)
   * @throws {RouterError} If the classification result is invalid
   */
  decide(classification: ClassificationResult): RoutingDecision {
    this.validate(classification);

    const topPrediction = this.getTopPrediction(classification);
    const decisionType = this.evaluateThresholds(topPrediction.confidence);

    return this.createDecision(decisionType, classification, topPrediction);
  }

  /**
   * Evaluates a single confidence score against the configured thresholds.
   *
   * @param score - Confidence score between 0 and 1
   * @returns The decision type based on threshold rules
   */
  evaluateThresholds(score: number): DecisionType {
    const { routeThreshold, fallbackThreshold, clarificationEnabled } = this.config;

    if (score >= routeThreshold) {
      return 'ROUTE';
    }

    if (score < fallbackThreshold) {
      return 'FALLBACK';
    }

    if (clarificationEnabled) {
      return 'CLARIFY';
    }

    return 'FALLBACK';
  }

  private validate(classification: ClassificationResult): void {
    if (!classification || !Array.isArray(classification.predictions)) {
      throw new RouterError(
        RouterErrorType.CLASSIFICATION_ERROR,
        'Invalid classification result: predictions array is required'
      );
    }

    if (classification.predictions.length === 0) {
      throw new RouterError(
        RouterErrorType.CLASSIFICATION_ERROR,
        'Invalid classification result: predictions array is empty'
      );
    }

    for (const prediction of classification.predictions) {
      if (
        typeof prediction.confidence !== 'number' ||
        prediction.confidence < 0 ||
        prediction.confidence > 1
      ) {
        throw new RouterError(
          RouterErrorType.CLASSIFICATION_ERROR,
          `Invalid confidence value: ${prediction.confidence}. Must be a number between 0 and 1.`
        );
      }

      if (!prediction.label || typeof prediction.label !== 'string') {
        throw new RouterError(
          RouterErrorType.CLASSIFICATION_ERROR,
          'Invalid prediction: label is required and must be a string'
        );
      }
    }
  }

  private getTopPrediction(classification: ClassificationResult): Prediction {
    return classification.predictions.reduce((top, current) =>
      current.confidence > top.confidence ? current : top
    );
  }

  private createDecision(
    type: DecisionType,
    classification: ClassificationResult,
    topPrediction: Prediction
  ): RoutingDecision {
    switch (type) {
      case 'ROUTE':
        return {
          type: 'ROUTE',
          target: topPrediction.label,
          confidence: topPrediction.confidence,
        };

      case 'CLARIFY':
        return {
          type: 'CLARIFY',
          confidence: topPrediction.confidence,
          options: this.getClarificationOptions(classification),
        };

      case 'FALLBACK':
        return {
          type: 'FALLBACK',
          confidence: topPrediction.confidence,
        };

      default:
        throw new RouterError(
          RouterErrorType.CONFIGURATION_ERROR,
          `Unexpected decision type: ${type}`
        );
    }
  }

  private getClarificationOptions(classification: ClassificationResult): string[] {
    const maxOptions = this.config.maxClarificationOptions ?? 3;
    return classification.predictions
      .slice()
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, maxOptions)
      .map((p) => p.label);
  }
}
