# @reaatech/confidence-router

[![npm version](https://img.shields.io/npm/v/@reaatech/confidence-router.svg)](https://www.npmjs.com/package/@reaatech/confidence-router)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/reaatech/confidence-router/blob/main/LICENSE)
[![CI](https://img.shields.io/github/actions/workflow/status/reaatech/confidence-router/ci.yml?branch=main&label=CI)](https://github.com/reaatech/confidence-router/actions/workflows/ci.yml)

> **Status:** Pre-1.0 — APIs may change in minor versions. Pin to a specific version in production.

A lightweight, pluggable routing engine that converts classification uncertainty into intelligent decisions. Given a classification result with confidence scores, it decides whether to **route**, **clarify**, or **fallback**.

This is the main entry point — it bundles all sub-packages (`core`, `classifiers`, `languages`, `evaluation`) and wires them together with sensible defaults. For tree-shaking or minimal installs, depend on the individual sub-packages directly.

## Installation

```bash
npm install @reaatech/confidence-router
# or
pnpm add @reaatech/confidence-router
```

Requires **Node.js >= 22**.

## Feature Overview

- **Threshold-based decision engine** — route high-confidence predictions, clarify ambiguous ones, fallback on uncertainty
- **Pluggable classifiers** — keyword, embedding similarity, and LLM (OpenAI/Anthropic) classifiers out of the box
- **Multi-language clarification** — 47 built-in locales with localized prompt templates and formatting
- **Fallback chain execution** — tries classifiers in priority order until one succeeds
- **Threshold optimization** — grid search across threshold combinations to maximize F1
- **Dependency injection** — swap out any component via constructor deps for custom behavior
- **Zero external runtime dependencies** — uses native `fetch` (Node 18+) for LLM calls
- **Dual ESM/CJS output** — works with `import` and `require`

## Quick Start

```typescript
import { ConfidenceRouter } from "@reaatech/confidence-router";

const router = new ConfidenceRouter({
  routeThreshold: 0.8,
  fallbackThreshold: 0.3,
  clarificationEnabled: true,
});

// Make a routing decision from a classification result
const decision = router.decide({
  predictions: [
    { label: "book_flight", confidence: 0.92 },
    { label: "check_status", confidence: 0.08 },
  ],
});

console.log(decision.type);  // "ROUTE"
console.log(decision.target); // "book_flight"
```

## API Reference

### `ConfidenceRouter` (class)

```typescript
import { ConfidenceRouter } from "@reaatech/confidence-router";

const router = new ConfidenceRouter(config?, deps?);
```

#### Constructor

| Parameter | Type | Description |
|-----------|------|-------------|
| `config` | `Partial<RouterConfig>` | Optional configuration overrides |
| `deps` | `ConfidenceRouterDeps` | Optional DI overrides for internal components |

#### `RouterConfig`

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `routeThreshold` | `number` | `0.8` | Confidence above this routes to the top label |
| `fallbackThreshold` | `number` | `0.3` | Confidence below this triggers fallback |
| `clarificationEnabled` | `boolean` | `true` | Enable the clarify decision band |
| `clarificationLanguages` | `string[]` | `["en"]` | Language codes for clarification prompts |
| `clarificationPromptTemplate` | `string` | — | Custom prompt with `{options}` placeholder |
| `maxClarificationOptions` | `number` | `3` | Max options to present in a clarify prompt |
| `defaultClassifier` | `string` | — | Default classifier name to use |
| `fallbackHandler` | `FallbackHandler` | — | Custom fallback decision handler |

#### Core Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `decide(classification)` | `RoutingDecision` | Evaluates classification against thresholds |
| `decideBatch(classifications)` | `RoutingDecision[]` | Batch evaluates multiple classifications |
| `classify(input, classifierName?, context?)` | `Promise<ClassificationResult>` | Classifies input with a registered classifier |
| `process(input, classifierName?)` | `Promise<RoutingDecision>` | End-to-end: classify then decide |
| `classifyWithFallback(input)` | `Promise<ClassificationResult>` | Runs the fallback chain of classifiers |

#### Configuration Methods

| Method | Description |
|--------|-------------|
| `updateConfig(config)` | Merges new config; re-creates the internal decision engine |
| `getConfig()` | Returns a copy of the current configuration |

#### Classifier Management

| Method | Description |
|--------|-------------|
| `registerClassifier(classifier)` | Registers a new classifier for use |
| `getClassifier(name)` | Retrieves a registered classifier by name |

#### Evaluation Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `evaluate(dataset)` | `EvaluationMetrics` | Evaluates current thresholds against a dataset |
| `optimizeThresholds(dataset, routeThresholds?, fallbackThresholds?)` | `OptimizedThresholds` | Grid search for optimal thresholds |

### `RouterFactory`

```typescript
import { RouterFactory } from "@reaatech/confidence-router";

const router = RouterFactory.create({ routeThreshold: 0.9 });
const defaultRouter = RouterFactory.createWithDefaults();
```

| Method | Description |
|--------|-------------|
| `RouterFactory.create(config?)` | Creates a configured `ConfidenceRouter` |
| `RouterFactory.createWithDefaults()` | Creates a `ConfidenceRouter` with all defaults |

## Decision Tree

```
                    ┌─────────────────────┐
                    │  Classification      │
                    │  Result (score)      │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
     score >= route     route > score    fallback >= score
       0.8 (default)    >= fallback      0.3 (default)
              │                │                │
              ▼                ▼                ▼
          ┌──────┐        ┌─────────┐     ┌──────────┐
          │ROUTE │        │ CLARIFY │     │ FALLBACK │
          └──────┘        └─────────┘     └──────────┘
```

## Usage Patterns

### With Built-in Classifiers

```typescript
import { ConfidenceRouter, KeywordClassifier } from "@reaatech/confidence-router";

const router = new ConfidenceRouter();

router.registerClassifier(new KeywordClassifier([
  { label: "book", keywords: ["book", "reserve"] },
  { label: "cancel", keywords: ["cancel", "refund"] },
  { label: "status", keywords: ["status", "track"] },
]));

const decision = await router.process("I want to book a flight");
```

### Multi-language Clarification

```typescript
const router = new ConfidenceRouter({
  clarificationLanguages: ["en", "es", "ja"],
});

const decision = router.decide({
  predictions: [
    { label: "book_flight", confidence: 0.55 },
    { label: "check_status", confidence: 0.45 },
  ],
});

console.log(decision.type);  // "CLARIFY"
console.log(decision.prompt); // "Did you mean: book_flight or check_status?"
```

### Threshold Optimization

```typescript
const router = new ConfidenceRouter();

const dataset = {
  examples: [
    { input: "book a flight", expectedLabel: "book_flight" },
    { input: "cancel reservation", expectedLabel: "cancel" },
  ],
};

const optimal = router.optimizeThresholds(dataset);
// → { routeThreshold: 0.75, fallbackThreshold: 0.2, score: 0.92, metrics: {...} }

router.updateConfig({
  routeThreshold: optimal.routeThreshold,
  fallbackThreshold: optimal.fallbackThreshold,
});
```

### Dependency Injection

```typescript
import { ConfidenceRouter } from "@reaatech/confidence-router";
import { LanguageManager, PromptGenerator } from "@reaatech/confidence-router-languages";

const lm = new LanguageManager();
lm.addLanguage({ code: "tlh", name: "Klingon", nativeName: "tlhIngan Hol", direction: "ltr", ... });

const router = new ConfidenceRouter(undefined, {
  languageManager: lm,
  promptGenerator: new PromptGenerator(lm),
});
```

## Related Packages

- [`@reaatech/confidence-router-core`](https://www.npmjs.com/package/@reaatech/confidence-router-core) — Core types, config, errors, DecisionEngine
- [`@reaatech/confidence-router-classifiers`](https://www.npmjs.com/package/@reaatech/confidence-router-classifiers) — Built-in classifier implementations
- [`@reaatech/confidence-router-languages`](https://www.npmjs.com/package/@reaatech/confidence-router-languages) — Multi-language support (47 locales)
- [`@reaatech/confidence-router-evaluation`](https://www.npmjs.com/package/@reaatech/confidence-router-evaluation) — Threshold optimization

## License

[MIT](https://github.com/reaatech/confidence-router/blob/main/LICENSE)
