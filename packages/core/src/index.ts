import type {
  ClassificationResult,
  Classifier,
  ClassifierConfig,
  ClassifierRegistryInterface,
  ConfidenceRouterDeps,
  ConfusionMatrix,
  DecisionType,
  EvaluationDataset,
  EvaluationMetrics,
  FallbackHandler,
  LabeledExample,
  LanguageConfig,
  LanguageManagerInterface,
  OptimizedThresholds,
  Prediction,
  PromptGeneratorInterface,
  RouterConfig,
  RouterInterface,
  RoutingDecision,
} from './types/index.js';

export type {
  ClassificationResult,
  Prediction,
  RoutingDecision,
  DecisionType,
  RouterConfig,
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
};

export { RouterError, RouterErrorType } from './types/errors.js';

export { DEFAULT_CONFIG, validateConfig, mergeConfig } from './config/index.js';

export { DecisionEngine } from './DecisionEngine.js';
