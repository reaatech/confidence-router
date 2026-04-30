export { ConfidenceRouter } from './ConfidenceRouter.js';
export { RouterFactory } from './RouterFactory.js';

export type {
  Prediction,
  ClassificationResult,
  RoutingDecision,
  RouterConfig,
  DecisionType,
  ClassifierConfig,
  Classifier,
  LanguageConfig,
  EvaluationDataset,
  LabeledExample,
  EvaluationMetrics,
  ConfusionMatrix,
  OptimizedThresholds,
  FallbackHandler,
  RouterInterface,
  LanguageManagerInterface,
  PromptGeneratorInterface,
  ClassifierRegistryInterface,
  ConfidenceRouterDeps,
} from '@reaatech/confidence-router-core';

export { RouterError, RouterErrorType } from '@reaatech/confidence-router-core';

export { DEFAULT_CONFIG, validateConfig, mergeConfig } from '@reaatech/confidence-router-core';

export { DecisionEngine } from '@reaatech/confidence-router-core';

export { LanguageManager } from '@reaatech/confidence-router-languages';
export { PromptGenerator } from '@reaatech/confidence-router-languages';

export { ClassifierRegistry } from '@reaatech/confidence-router-classifiers';
export { KeywordClassifier } from '@reaatech/confidence-router-classifiers';
export type {
  KeywordPattern,
  KeywordClassifierOptions,
  MatchMode,
} from '@reaatech/confidence-router-classifiers';
export { EmbeddingSimilarityClassifier } from '@reaatech/confidence-router-classifiers';
export type {
  ReferenceVector,
  EmbeddingProvider,
  EmbeddingSimilarityClassifierOptions,
} from '@reaatech/confidence-router-classifiers';
export { LLMClassifier } from '@reaatech/confidence-router-classifiers';
export type {
  LLMProvider,
  LLMClassifierOptions,
} from '@reaatech/confidence-router-classifiers';

export { ThresholdOptimizer } from '@reaatech/confidence-router-evaluation';
