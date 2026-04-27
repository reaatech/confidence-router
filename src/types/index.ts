/**
 * Core type definitions for confidence-router
 */

export interface Prediction {
  label: string;
  confidence: number;
  metadata?: Record<string, unknown>;
}

export interface ClassificationResult {
  predictions: Prediction[];
  metadata?: {
    model?: string;
    latency?: number;
    tokens?: number;
  } & Record<string, unknown>;
}

export type DecisionType = 'ROUTE' | 'CLARIFY' | 'FALLBACK';

export interface RoutingDecision {
  type: DecisionType;
  confidence?: number;
  target?: string;
  prompt?: string;
  options?: string[];
  metadata?: Record<string, unknown>;
}

export interface RouterConfig {
  routeThreshold: number;
  fallbackThreshold: number;
  clarificationEnabled: boolean;
  clarificationLanguages?: string[];
  clarificationPromptTemplate?: string;
  maxClarificationOptions?: number;
  defaultClassifier?: string;
  fallbackHandler?: FallbackHandler;
}

export type FallbackHandler = (classification: ClassificationResult) => RoutingDecision;

export interface ClassifierConfig {
  name: string;
  type: 'llm' | 'embedding' | 'keyword' | 'custom';
  enabled: boolean;
  priority: number;
  timeout?: number;
  retries?: number;
  cacheEnabled?: boolean;
}

export interface Classifier {
  name: string;
  type: string;
  enabled: boolean;
  priority: number;
  classify(input: string, context?: Record<string, unknown>): Promise<ClassificationResult>;
  validate?(): Promise<boolean>;
}

export interface LanguageConfig {
  code: string;
  name: string;
  nativeName: string;
  direction: 'ltr' | 'rtl';
  clarificationTemplates: {
    basic: string;
  };
  formatting: {
    listSeparator: string;
    conjunction?: string;
  };
}

export interface EvaluationDataset {
  examples: LabeledExample[];
  metadata?: Record<string, unknown>;
}

export interface LabeledExample {
  input: string;
  expectedLabel: string;
  expectedDecision?: DecisionType;
  predictions?: Prediction[];
  context?: Record<string, unknown>;
}

export interface EvaluationMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  confusionMatrix: ConfusionMatrix;
  decisionsByType: Record<DecisionType, number>;
}

export interface ConfusionMatrix {
  [expected: string]: {
    [predicted: string]: number;
  };
}

export interface OptimizedThresholds {
  routeThreshold: number;
  fallbackThreshold: number;
  score: number;
  metrics: EvaluationMetrics;
}
