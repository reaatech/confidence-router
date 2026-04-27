# Confidence Router

<p align="center">
  <strong>Decision engine for route / clarify / fallback patterns</strong><br>
  A lightweight, pluggable routing engine that converts classification uncertainty into intelligent decisions.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/confidence-router"><img src="https://img.shields.io/npm/v/confidence-router?color=blue" alt="npm version"></a>
  <a href="https://github.com/reaatech/confidence-router/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/confidence-router" alt="license"></a>
  <a href="https://nodejs.org/"><img src="https://img.shields.io/node/v/confidence-router" alt="node"></a>
  <a href="https://bundlejs.com/?q=confidence-router"><img src="https://img.shields.io/bundlejs/size/confidence-router" alt="bundle size"></a>
  <a href="https://github.com/reaatech/confidence-router/actions"><img src="https://img.shields.io/github/actions/workflow/status/reaatech/confidence-router/ci.yml?branch=main" alt="CI"></a>
</p>

---

## What It Does

Given a classification result with confidence scores, Confidence Router decides whether to:

- **Route** — forward to the top match when confidence is high
- **Clarify** — ask the user to disambiguate when the model is uncertain
- **Fallback** — delegate to a default handler when confidence is too low

It is the confidence gate from AskGM, extracted and generalized for use in any application that needs to route decisions based on model confidence.

---

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Features](#features)
- [API Reference](#api-reference)
  - [ConfidenceRouter](#confidencerouter)
  - [RouterConfig](#routerconfig)
  - [Built-in Classifiers](#built-in-classifiers)
  - [Evaluation](#evaluation)
- [Decision Tree](#decision-tree)
- [Examples](#examples)
- [Documentation](#documentation)
- [License](#license)

---

## Installation

```bash
# pnpm
pnpm add confidence-router

# npm
npm install confidence-router

# yarn
yarn add confidence-router
```

Requires **Node.js >= 20**.

---

## Quick Start

```typescript
import { ConfidenceRouter } from 'confidence-router';

const router = new ConfidenceRouter({
  routeThreshold: 0.8,
  fallbackThreshold: 0.3,
  clarificationEnabled: true,
});

const classification = {
  predictions: [
    { label: 'book_flight', confidence: 0.85 },
    { label: 'check_status', confidence: 0.10 },
    { label: 'cancel_booking', confidence: 0.05 },
  ],
};

const decision = router.decide(classification);

if (decision.type === 'ROUTE') {
  console.log(`Routing to: ${decision.target}`);
  // → Routing to: book_flight
} else if (decision.type === 'CLARIFY') {
  console.log(decision.prompt);
  // → "Did you mean: book_flight or check_status?"
} else {
  console.log('Falling back to default handler');
}
```

### End-to-end classification + routing

```typescript
import { ConfidenceRouter, LLMClassifier } from 'confidence-router';

const router = new ConfidenceRouter({
  routeThreshold: 0.8,
  fallbackThreshold: 0.3,
});

router.registerClassifier(
  new LLMClassifier({
    provider: 'openai',
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4o-mini',
    labels: ['book_flight', 'check_status', 'cancel_booking'],
  }),
);

const decision = await router.process('I need a flight to London');

// decision.type === 'ROUTE'
// decision.target === 'book_flight'
```

---

## Features

| Feature | Description |
|---------|-------------|
| **Configurable Thresholds** | Independently tune route and fallback confidence boundaries |
| **47-Language Clarification** | Prompts in 45+ languages via ISO 639-1 codes, with cultural formatting |
| **Pluggable Classifiers** | Keyword, embedding similarity, and LLM (OpenAI/Anthropic) classifiers with a unified interface |
| **Fallback Chains** | Chain multiple classifiers together with automatic fallback on failure |
| **Evaluation Harness** | Grid-search threshold optimization against labeled datasets |
| **Batch Processing** | Process multiple classifications in a single call |
| **Zero Dependencies** | Core engine has no external dependencies |
| **TypeScript-First** | Strict types, full generics support, and `.d.ts` exports |
| **Dual CJS/ESM** | Ships as both CommonJS and ES module |
| **Lightweight** | Under 100 KB gzipped |

---

## API Reference

### ConfidenceRouter

```typescript
import { ConfidenceRouter } from 'confidence-router';

const router = new ConfidenceRouter(config);
```

| Method | Returns | Description |
|--------|---------|-------------|
| `decide(classification)` | `RoutingDecision` | Make a routing decision from a classification result |
| `decideBatch(classifications)` | `RoutingDecision[]` | Batch process multiple classifications |
| `process(input, classifierName?)` | `Promise<RoutingDecision>` | End-to-end: classify input then decide |
| `classify(input, classifierName?, context?)` | `Promise<ClassificationResult>` | Classify input using a registered classifier |
| `classifyWithFallback(input)` | `Promise<ClassificationResult>` | Run the classifier fallback chain |
| `registerClassifier(classifier)` | `void` | Add a classifier to the registry |
| `getClassifier(name)` | `Classifier \| undefined` | Retrieve a registered classifier |
| `evaluate(dataset)` | `EvaluationMetrics` | Evaluate current thresholds against labeled data |
| `optimizeThresholds(dataset, routeTs?, fallbackTs?)` | `OptimizedThresholds` | Grid-search optimal thresholds |
| `updateConfig(partial)` | `void` | Dynamically update router configuration |
| `getConfig()` | `RouterConfig` | Get a copy of the current configuration |

### RoutingDecision

```typescript
type RoutingDecision =
  | { type: 'ROUTE'; target: string; confidence: number }
  | { type: 'CLARIFY'; prompt: string; options: string[]; confidence: number }
  | { type: 'FALLBACK'; reason?: string; confidence: number };
```

### RouterConfig

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `routeThreshold` | `number` | `0.8` | Confidence >= this → ROUTE |
| `fallbackThreshold` | `number` | `0.3` | Confidence < this → FALLBACK |
| `clarificationEnabled` | `boolean` | `true` | Enable clarification prompts in the uncertainty zone |
| `clarificationLanguages` | `string[]` | `['en']` | ISO 639-1 language codes for prompts |
| `maxClarificationOptions` | `number` | `3` | Max options shown in clarification prompts |
| `fallbackHandler` | `(prediction) => unknown` | — | Custom handler for FALLBACK decisions |

### Built-in Classifiers

```typescript
import {
  KeywordClassifier,
  EmbeddingSimilarityClassifier,
  LLMClassifier,
} from 'confidence-router';
```

#### Keyword Classifier

Deterministic, zero-dependency pattern matching.

```typescript
const keyword = new KeywordClassifier([
  { label: 'book_flight', keywords: ['flight', 'fly', 'ticket'] },
  { label: 'cancel_booking', keywords: ['cancel', 'refund', 'delete'] },
]);
```

#### Embedding Similarity Classifier

Vector-based similarity matching with a bring-your-own embedding provider.

```typescript
const embedding = new EmbeddingSimilarityClassifier(
  [
    { label: 'book_flight', vector: [0.9, 0.1, 0.2] },
    { label: 'cancel_booking', vector: [0.1, 0.8, 0.3] },
  ],
  {
    embeddingProvider: async (text) => {
      // Call your embedding API
      return [0.85, 0.12, 0.15];
    },
  },
);

const result = await embedding.classify('I want to book a flight');
```

#### LLM Classifier

Classification via OpenAI or Anthropic models.

```typescript
const llm = new LLMClassifier({
  provider: 'openai',
  apiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-4o-mini',
  labels: ['book_flight', 'check_status', 'cancel_booking'],
  temperature: 0,
});

const result = await llm.classify('Can I cancel my booking?');
```

### Evaluation

```typescript
const dataset = {
  examples: [
    { input: 'book a flight to Tokyo', expectedLabel: 'book_flight' },
    { input: 'cancel my reservation', expectedLabel: 'cancel_booking' },
    // ... more labeled examples
  ],
};

// Evaluate current thresholds
const metrics = router.evaluate(dataset);
console.log(`F1 Score: ${(metrics.f1Score * 100).toFixed(1)}%`);

// Grid search for optimal thresholds
const optimized = router.optimizeThresholds(
  dataset,
  [0.5, 0.6, 0.7, 0.8, 0.9],  // route threshold candidates
  [0.1, 0.2, 0.3, 0.4],        // fallback threshold candidates
);

router.updateConfig(optimized);
```

---

## Decision Tree

```
                     ┌─────────────────┐
                     │ Classification  │
                     │     Result      │
                     └────────┬────────┘
                              │
                     ┌────────▼────────┐
                     │ Top Confidence  │
                     │     Score       │
                     └────────┬────────┘
                              │
                 ┌─────────────┼─────────────┐
                 │             │             │
     ┌───────────▼──┐ ┌────────▼────────┐ ┌─▼────────────┐
     │ Score >=     │ │ Score in        │ │ Score <      │
     │ Route        │ │ Uncertainty     │ │ Fallback     │
     │ Threshold    │ │ Zone            │ │ Threshold    │
     └───────────┬──┘ └────────┬────────┘ └─┬────────────┘
                 │             │             │
     ┌───────────▼──┐ ┌────────▼────────┐ ┌─▼────────────┐
     │ ROUTE        │ │ CLARIFY         │ │ FALLBACK     │
     │ to top match │ │ ask user        │ │ to default   │
     └──────────────┘ └─────────────────┘ └──────────────┘
```

---

## Examples

Full runnable examples are available in the [`examples/`](./examples) directory:

| Example | Description |
|---------|-------------|
| [`basic-routing.ts`](./examples/basic-routing.ts) | Route, clarify, and fallback decisions |
| [`built-in-classifiers.ts`](./examples/built-in-classifiers.ts) | Keyword, embedding, and LLM classifiers |
| [`custom-classifier.ts`](./examples/custom-classifier.ts) | Implementing a custom classifier |
| [`evaluation.ts`](./examples/evaluation.ts) | Threshold optimization with grid search |
| [`multi-language.ts`](./examples/multi-language.ts) | Clarification prompts in 45+ languages |

---

## Documentation

- [Architecture](./ARCHITECTURE.md) — system design and component details
- [Development Plan](./DEV_PLAN.md) — roadmap and milestones
- [Changelog](./CHANGELOG.md) — release history
- [Contributing](./CONTRIBUTING.md) — contribution guidelines

---

## License

MIT © [reaatech](https://github.com/reaatech)
