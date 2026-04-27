/**
 * confidence-router
 * Decision engine for route/clarify/fallback patterns
 */

// Core
export { ConfidenceRouter } from './core/ConfidenceRouter.js';
export { DecisionEngine } from './core/DecisionEngine.js';
export { RouterFactory } from './core/RouterFactory.js';

// Types
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
} from './types/index.js';

// Errors
export { RouterError, RouterErrorType } from './types/errors.js';

// Config
export { DEFAULT_CONFIG, validateConfig, mergeConfig } from './config/index.js';

// Languages
export { LanguageManager } from './languages/LanguageManager.js';
export { PromptGenerator } from './languages/PromptGenerator.js';

// Classifiers
export { ClassifierRegistry } from './classifiers/ClassifierRegistry.js';
export { KeywordClassifier } from './classifiers/KeywordClassifier.js';
export type {
  KeywordPattern,
  KeywordClassifierOptions,
  MatchMode,
} from './classifiers/KeywordClassifier.js';
export { EmbeddingSimilarityClassifier } from './classifiers/EmbeddingSimilarityClassifier.js';
export type {
  ReferenceVector,
  EmbeddingProvider,
  EmbeddingSimilarityClassifierOptions,
} from './classifiers/EmbeddingSimilarityClassifier.js';
export { LLMClassifier } from './classifiers/LLMClassifier.js';
export type { LLMProvider, LLMClassifierOptions } from './classifiers/LLMClassifier.js';

// Evaluation
export { ThresholdOptimizer } from './evaluation/ThresholdOptimizer.js';
