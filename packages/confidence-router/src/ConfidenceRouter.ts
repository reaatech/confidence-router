import { ClassifierRegistry } from '@reaatech/confidence-router-classifiers';
import type {
  ClassificationResult,
  Classifier,
  ConfidenceRouterDeps,
  EvaluationDataset,
  EvaluationMetrics,
  FallbackHandler,
  OptimizedThresholds,
  RouterConfig,
  RoutingDecision,
} from '@reaatech/confidence-router-core';
import { DecisionEngine, mergeConfig, validateConfig } from '@reaatech/confidence-router-core';
import { ThresholdOptimizer } from '@reaatech/confidence-router-evaluation';
import { LanguageManager } from '@reaatech/confidence-router-languages';
import { PromptGenerator } from '@reaatech/confidence-router-languages';

export class ConfidenceRouter {
  private config: RouterConfig;
  private engine: DecisionEngine;
  private languageManager: LanguageManager;
  private promptGenerator: PromptGenerator;
  private classifierRegistry: ClassifierRegistry;
  private fallbackHandler?: FallbackHandler;

  constructor(config?: Partial<RouterConfig>, deps?: ConfidenceRouterDeps) {
    this.config = mergeConfig(config);
    validateConfig(this.config);

    this.engine = new DecisionEngine(this.config);
    this.languageManager =
      (deps?.languageManager as LanguageManager | undefined) ?? new LanguageManager();
    this.promptGenerator =
      (deps?.promptGenerator as PromptGenerator | undefined) ??
      new PromptGenerator(this.languageManager);
    this.classifierRegistry =
      (deps?.classifierRegistry as ClassifierRegistry | undefined) ?? new ClassifierRegistry();
    this.fallbackHandler = this.config.fallbackHandler;
  }

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

  decideBatch(classifications: ClassificationResult[]): RoutingDecision[] {
    return classifications.map((c) => this.decide(c));
  }

  async classify(
    input: string,
    classifierName?: string,
    context?: Record<string, unknown>,
  ): Promise<ClassificationResult> {
    return this.classifierRegistry.classify(input, classifierName, context);
  }

  async process(input: string, classifierName?: string): Promise<RoutingDecision> {
    const classification = await this.classify(input, classifierName);
    return this.decide(classification);
  }

  async classifyWithFallback(input: string): Promise<ClassificationResult> {
    return this.classifierRegistry.getFallbackChain(input);
  }

  updateConfig(config: Partial<RouterConfig>): void {
    this.config = mergeConfig({ ...this.config, ...config });
    validateConfig(this.config);
    this.engine = new DecisionEngine(this.config);
  }

  getConfig(): RouterConfig {
    return {
      ...this.config,
      clarificationLanguages: [...(this.config.clarificationLanguages ?? [])],
    };
  }

  registerClassifier(classifier: Classifier): void {
    this.classifierRegistry.register(classifier);
  }

  getClassifier(name: string): Classifier | undefined {
    return this.classifierRegistry.get(name);
  }

  evaluate(dataset: EvaluationDataset): EvaluationMetrics {
    const optimizer = new ThresholdOptimizer(this, dataset);
    return optimizer.evaluateWithCurrentThresholds();
  }

  optimizeThresholds(
    dataset: EvaluationDataset,
    routeThresholds?: number[],
    fallbackThresholds?: number[],
  ): OptimizedThresholds {
    const optimizer = new ThresholdOptimizer(this, dataset);
    return optimizer.gridSearch(routeThresholds, fallbackThresholds);
  }

  private enrichClarification(
    decision: RoutingDecision,
    classification: ClassificationResult,
  ): RoutingDecision {
    const language = this.config.clarificationLanguages?.[0] ?? 'en';
    const prompt = this.promptGenerator.generate(
      classification.predictions,
      language,
      this.config.clarificationPromptTemplate,
      this.config.maxClarificationOptions,
    );

    return {
      ...decision,
      prompt,
    };
  }
}
