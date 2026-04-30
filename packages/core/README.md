# @reaatech/confidence-router-core

[![npm version](https://img.shields.io/npm/v/@reaatech/confidence-router-core.svg)](https://www.npmjs.com/package/@reaatech/confidence-router-core)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/reaatech/confidence-router/blob/main/LICENSE)
[![CI](https://img.shields.io/github/actions/workflow/status/reaatech/confidence-router/ci.yml?branch=main&label=CI)](https://github.com/reaatech/confidence-router/actions/workflows/ci.yml)

> **Status:** Pre-1.0 — APIs may change in minor versions. Pin to a specific version in production.

Core type definitions, error classes, configuration utilities, and the `DecisionEngine` for the confidence-router ecosystem. This package is the single source of truth for all type shapes used throughout `@reaatech/confidence-router-*`.

## Installation

```bash
npm install @reaatech/confidence-router-core
# or
pnpm add @reaatech/confidence-router-core
```

## Feature Overview

- **All public type definitions** — `Prediction`, `ClassificationResult`, `RoutingDecision`, `RouterConfig`, `Classifier` interface, and more
- **Typed error class** — `RouterError` with enumerated `RouterErrorType` codes for every failure mode
- **DecisionEngine** — pure-function threshold evaluator that scores confidence against route/clarify/fallback boundaries
- **Configuration utilities** — `DEFAULT_CONFIG`, `validateConfig`, `mergeConfig` with built-in sanity checks
- **Dependency injection interfaces** — `RouterInterface`, `ClassifierRegistryInterface`, `LanguageManagerInterface`, `PromptGeneratorInterface`, `ConfidenceRouterDeps`
- **Zero runtime dependencies** — lightweight and tree-shakeable
- **Dual ESM/CJS output** — works with `import` and `require`

## Quick Start

```typescript
import { DecisionEngine, mergeConfig, RouterError, RouterErrorType } from "@reaatech/confidence-router-core";

const engine = new DecisionEngine(
  mergeConfig({ routeThreshold: 0.8, fallbackThreshold: 0.3, clarificationEnabled: true })
);

const decision = engine.decide({
  predictions: [
    { label: "book_flight", confidence: 0.92 },
    { label: "check_status", confidence: 0.08 },
  ],
});

console.log(decision.type); // "ROUTE"
```

## API Reference

### Types

| Export | Description |
|--------|-------------|
| `Prediction` | `{ label: string; confidence: number; metadata?: Record<string, unknown> }` |
| `ClassificationResult` | `{ predictions: Prediction[]; metadata?: ... }` |
| `RoutingDecision` | `{ type: DecisionType; confidence?, target?, prompt?, options?, metadata? }` |
| `RouterConfig` | All configuration fields: `routeThreshold`, `fallbackThreshold`, `clarificationEnabled`, `clarificationLanguages?`, `maxClarificationOptions?`, etc. |
| `DecisionType` | Union: `"ROUTE" \| "CLARIFY" \| "FALLBACK"` |
| `Classifier` | Interface: `name`, `type`, `enabled`, `priority`, `classify(input, context?)`, `validate?()` |
| `LanguageConfig` | `{ code, name, nativeName, direction, clarificationTemplates, formatting }` |
| `EvaluationDataset` | `{ examples: LabeledExample[]; metadata? }` |
| `LabeledExample` | `{ input, expectedLabel, expectedDecision?, predictions?, context? }` |
| `EvaluationMetrics` | `{ accuracy, precision, recall, f1Score, confusionMatrix, decisionsByType }` |
| `OptimizedThresholds` | `{ routeThreshold, fallbackThreshold, score, metrics }` |
| `FallbackHandler` | `(classification: ClassificationResult) => RoutingDecision` |

### Errors

All errors extend the standard `Error` class and carry a `type` discriminator.

| Class | Type Enum | When |
|-------|-----------|------|
| `RouterError` | (varies) | Base class for all routing errors |
| `RouterErrorType.CONFIGURATION_ERROR` | — | Invalid configuration |
| `RouterErrorType.CLASSIFICATION_ERROR` | — | Invalid classifier output |
| `RouterErrorType.LANGUAGE_NOT_SUPPORTED` | — | Unknown language code |
| `RouterErrorType.THRESHOLD_INVALID` | — | Threshold out of [0, 1] range |
| `RouterErrorType.CLASSIFIER_NOT_FOUND` | — | Named classifier not registered |
| `RouterErrorType.DATASET_INVALID` | — | Evaluation dataset invalid |

```typescript
import { RouterError, RouterErrorType } from "@reaatech/confidence-router-core";

throw new RouterError(
  RouterErrorType.THRESHOLD_INVALID,
  "routeThreshold must be between 0 and 1",
  { detail: "extra context" }
);
```

### DecisionEngine

```typescript
import { DecisionEngine } from "@reaatech/confidence-router-core";
```

| Method | Returns | Description |
|--------|---------|-------------|
| `decide(classification)` | `RoutingDecision` | Evaluates top prediction confidence against configured thresholds |
| `evaluateThresholds(score)` | `DecisionType` | Maps a raw confidence score to `ROUTE`, `CLARIFY`, or `FALLBACK` |

### Configuration Utilities

| Export | Description |
|--------|-------------|
| `DEFAULT_CONFIG` | Default `RouterConfig` (`routeThreshold: 0.8`, `fallbackThreshold: 0.3`, `clarificationEnabled: true`) |
| `validateConfig(config)` | Throws `RouterError` if thresholds are invalid or `maxClarificationOptions < 2` |
| `mergeConfig(partial?)` | Merges a partial config with defaults |

### Dependency Injection Interfaces

| Interface | Methods |
|-----------|---------|
| `RouterInterface` | `decide()`, `getConfig()`, `updateConfig()` |
| `ClassifierRegistryInterface` | `register()`, `get()`, `classify()`, `getFallbackChain()` |
| `LanguageManagerInterface` | `getLanguage()`, `addLanguage()`, `hasLanguage()`, `getSupportedLanguages()` |
| `PromptGeneratorInterface` | `generate(predictions, languageCode, customTemplate?, maxOptions?)` |
| `ConfidenceRouterDeps` | `{ languageManager?, promptGenerator?, classifierRegistry? }` |

## Usage with Dependency Injection

The `ConfidenceRouterDeps` interface allows callers to inject custom implementations:

```typescript
import type { ConfidenceRouterDeps } from "@reaatech/confidence-router-core";

const deps: ConfidenceRouterDeps = {
  languageManager: new CustomLanguageManager(),
  promptGenerator: new CustomPromptGenerator(lm),
  classifierRegistry: new CustomRegistry(),
};
```

## Decision Logic

```
score >= routeThreshold    →  ROUTE
score <  fallbackThreshold  →  FALLBACK
otherwise (clarify enabled)  →  CLARIFY
otherwise                    →  FALLBACK
```

## Related Packages

- [`@reaatech/confidence-router`](https://www.npmjs.com/package/@reaatech/confidence-router) — Full router with all batteries included
- [`@reaatech/confidence-router-classifiers`](https://www.npmjs.com/package/@reaatech/confidence-router-classifiers) — Built-in classifier implementations
- [`@reaatech/confidence-router-languages`](https://www.npmjs.com/package/@reaatech/confidence-router-languages) — Multi-language support (47 locales)
- [`@reaatech/confidence-router-evaluation`](https://www.npmjs.com/package/@reaatech/confidence-router-evaluation) — Threshold optimization and evaluation

## License

[MIT](https://github.com/reaatech/confidence-router/blob/main/LICENSE)
