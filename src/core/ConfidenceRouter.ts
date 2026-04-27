import type {
  ClassificationResult,
  RoutingDecision,
  RouterConfig,
  Classifier,
  FallbackHandler,
  EvaluationDataset,
  EvaluationMetrics,
  OptimizedThresholds,
} from '../types/index.js';
import { DecisionEngine } from './DecisionEngine.js';
import { mergeConfig, validateConfig } from '../config/index.js';
import { PromptGenerator } from '../languages/PromptGenerator.js';
import { LanguageManager } from '../languages/LanguageManager.js';
import { ClassifierRegistry } from '../classifiers/ClassifierRegistry.js';
import { ThresholdOptimizer } from '../evaluation/ThresholdOptimizer.js';

/**
 * Main router class that orchestrates classification, decision-making,
 * clarification prompt generation, and threshold optimization.
 *
 * @example
 * ```typescript
 * const router = new ConfidenceRouter({
 *   routeThreshold: 0.8,
 *   fallbackThreshold: 0.3,
 *   clarificationEnabled: true,
 * });
 *
 * const decision = router.decide(classification);
 * ```
 */
export class ConfidenceRouter {
  private config: RouterConfig;
  private engine: DecisionEngine;
  private languageManager: LanguageManager;
  private promptGenerator: PromptGenerator;
  private classifierRegistry: ClassifierRegistry;
  private fallbackHandler?: FallbackHandler;

  /**
   * Creates a new ConfidenceRouter instance.
   *
   * @param config - Optional partial configuration. Defaults are used for omitted fields.
   */
  constructor(config?: Partial<RouterConfig>) {
    this.config = mergeConfig(config);
    validateConfig(this.config);

    this.engine = new DecisionEngine(this.config);
    this.languageManager = new LanguageManager();
    this.promptGenerator = new PromptGenerator(this.languageManager);
    this.classifierRegistry = new ClassifierRegistry();
    this.fallbackHandler = this.config.fallbackHandler;
  }

  /**
   * Makes a routing decision based on a classification result.
   *
   * @param classification - The classification result with confidence scores
   * @returns A routing decision (ROUTE, CLARIFY, or FALLBACK)
   */
  decide(classification: ClassificationResult): RoutingDecision {
    const decision = this.engine.decide(classification);

    if (decision.type === 'CLARIFY') {
      return this.enrichClarification(decision, classification);
    }

    if (decision.type === 'FALLBACK' && this.fallbackHandler) {
      return this.fallbackHandler(classification);
    }

    return decision;
  }

  /**
   * Processes multiple classifications in batch.
   *
   * @param classifications - Array of classification results
   * @returns Array of routing decisions
   */
  decideBatch(classifications: ClassificationResult[]): RoutingDecision[] {
    return classifications.map((c) => this.decide(c));
  }

  /**
   * Classifies input text using a registered classifier.
   *
   * @param input - The text to classify
   * @param classifierName - Optional specific classifier name. Uses default if omitted.
   * @returns The classification result
   * @throws {RouterError} If no classifier is available
   */
  async classify(
    input: string,
    classifierName?: string,
    context?: Record<string, unknown>
  ): Promise<ClassificationResult> {
    return this.classifierRegistry.classify(input, classifierName, context);
  }

  /**
   * End-to-end processing: classifies input then makes a routing decision.
   *
   * @param input - The text to process
   * @param classifierName - Optional specific classifier name
   * @returns The final routing decision
   */
  async process(input: string, classifierName?: string): Promise<RoutingDecision> {
    const classification = await this.classify(input, classifierName);
    return this.decide(classification);
  }

  /**
   * Runs the classifier fallback chain and returns the first successful result.
   *
   * @param input - The text to classify
   * @returns The classification result from the first successful classifier
   * @throws {RouterError} If all classifiers in the chain fail
   */
  async classifyWithFallback(input: string): Promise<ClassificationResult> {
    return this.classifierRegistry.getFallbackChain(input);
  }

  /**
   * Updates the router configuration dynamically.
   * Re-creates the internal decision engine with new settings.
   *
   * @param config - Partial configuration to merge with current settings
   * @throws {RouterError} If the merged configuration is invalid
   */
  updateConfig(config: Partial<RouterConfig>): void {
    this.config = mergeConfig({ ...this.config, ...config });
    validateConfig(this.config);
    this.engine = new DecisionEngine(this.config);
  }

  /**
   * Returns a copy of the current router configuration.
   */
  getConfig(): RouterConfig {
    return {
      ...this.config,
      clarificationLanguages: [...(this.config.clarificationLanguages ?? [])],
    };
  }

  /**
   * Registers a new classifier for use by the router.
   *
   * @param classifier - The classifier implementation
   */
  registerClassifier(classifier: Classifier): void {
    this.classifierRegistry.register(classifier);
  }

  /**
   * Retrieves a registered classifier by name.
   *
   * @param name - The classifier name
   * @returns The classifier, or undefined if not found
   */
  getClassifier(name: string): Classifier | undefined {
    return this.classifierRegistry.get(name);
  }

  /**
   * Evaluates the current thresholds against a labeled dataset.
   *
   * @param dataset - The evaluation dataset
   * @returns Performance metrics (accuracy, precision, recall, F1)
   */
  evaluate(dataset: EvaluationDataset): EvaluationMetrics {
    const optimizer = new ThresholdOptimizer(this, dataset);
    return optimizer.evaluateWithCurrentThresholds();
  }

  /**
   * Performs a grid search to find optimal threshold values.
   *
   * @param dataset - The evaluation dataset
   * @param routeThresholds - Optional array of route thresholds to test
   * @param fallbackThresholds - Optional array of fallback thresholds to test
   * @returns The optimal thresholds and their performance metrics
   */
  optimizeThresholds(
    dataset: EvaluationDataset,
    routeThresholds?: number[],
    fallbackThresholds?: number[]
  ): OptimizedThresholds {
    const optimizer = new ThresholdOptimizer(this, dataset);
    return optimizer.gridSearch(routeThresholds, fallbackThresholds);
  }

  private enrichClarification(
    decision: RoutingDecision,
    classification: ClassificationResult
  ): RoutingDecision {
    const language = this.config.clarificationLanguages?.[0] ?? 'en';
    const prompt = this.promptGenerator.generate(
      classification.predictions,
      language,
      this.config.clarificationPromptTemplate,
      this.config.maxClarificationOptions
    );

    return {
      ...decision,
      prompt,
    };
  }
}
