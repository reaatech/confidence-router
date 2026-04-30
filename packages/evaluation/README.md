# @reaatech/confidence-router-evaluation

[![npm version](https://img.shields.io/npm/v/@reaatech/confidence-router-evaluation.svg)](https://www.npmjs.com/package/@reaatech/confidence-router-evaluation)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/reaatech/confidence-router/blob/main/LICENSE)
[![CI](https://img.shields.io/github/actions/workflow/status/reaatech/confidence-router/ci.yml?branch=main&label=CI)](https://github.com/reaatech/confidence-router/actions/workflows/ci.yml)

> **Status:** Pre-1.0 — APIs may change in minor versions. Pin to a specific version in production.

Threshold optimization and evaluation harness for confidence-router. Performs grid search across threshold combinations to maximize F1 score against labeled datasets, then reports accuracy, precision, recall, and confusion matrices.

## Installation

```bash
npm install @reaatech/confidence-router-evaluation
# or
pnpm add @reaatech/confidence-router-evaluation
```

## Feature Overview

- **Grid search optimization** — tunes `routeThreshold` and `fallbackThreshold` against a dataset
- **Performance metrics** — accuracy, precision, recall, F1 score, and confusion matrix per class
- **Decision distribution** — counts of ROUTE / CLARIFY / FALLBACK decisions
- **Original threshold restoration** — always restores router settings after optimization, even on error
- **Synthetic prediction support** — works with datasets that lack classifier output (generates deterministic synthetic predictions)
- **Works with any `RouterInterface`** — not coupled to `ConfidenceRouter`, accepts any compliant object

## Quick Start

```typescript
import { ThresholdOptimizer } from "@reaatech/confidence-router-evaluation";
import type { RouterInterface, EvaluationDataset } from "@reaatech/confidence-router-core";

const dataset: EvaluationDataset = {
  examples: [
    { input: "book a flight", expectedLabel: "book_flight" },
    { input: "cancel my reservation", expectedLabel: "cancel_booking" },
    { input: "check my flight status", expectedLabel: "check_status" },
  ],
};

// router: any object implementing RouterInterface (decide, getConfig, updateConfig)
const optimizer = new ThresholdOptimizer(router, dataset);

// Evaluate with current thresholds
const metrics = optimizer.evaluateWithCurrentThresholds();
console.log(`Accuracy: ${metrics.accuracy}, F1: ${metrics.f1Score}`);

// Find optimal thresholds via grid search
const optimal = optimizer.gridSearch();
console.log(`Best route: ${optimal.routeThreshold}, fallback: ${optimal.fallbackThreshold}`);
```

## API Reference

### `ThresholdOptimizer`

```typescript
import { ThresholdOptimizer } from "@reaatech/confidence-router-evaluation";
```

#### Constructor

```typescript
new ThresholdOptimizer(router: RouterInterface, dataset: EvaluationDataset)
```

Validates that the dataset has examples with `input` and `expectedLabel` fields. Throws `RouterError` with `DATASET_INVALID` if the dataset is empty or malformed.

#### Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `evaluateWithCurrentThresholds()` | `EvaluationMetrics` | Scores the router's current thresholds against the dataset |
| `gridSearch(routeThresholds?, fallbackThresholds?)` | `OptimizedThresholds` | Searches threshold combinations to maximize F1 score |

### `EvaluationMetrics`

```typescript
{
  accuracy: number;           // 0–1
  precision: number;          // 0–1
  recall: number;             // 0–1
  f1Score: number;            // 0–1
  confusionMatrix: ConfusionMatrix;
  decisionsByType: Record<DecisionType, number>;
}
```

### `OptimizedThresholds`

```typescript
{
  routeThreshold: number;
  fallbackThreshold: number;
  score: number;              // best F1 score achieved
  metrics: EvaluationMetrics; // full metrics at the optimal thresholds
}
```

### Grid Search Behavior

By default, grid search tests these ranges:

- `routeThresholds`: 0.50, 0.55, 0.60, ..., 0.95 (10 steps)
- `fallbackThresholds`: 0.10, 0.15, 0.20, ..., 0.50 (9 steps)

Invalid combinations (`fallback >= route`) are skipped. Custom ranges can be passed directly.

## Usage Patterns

### With Synthetic Data

When evaluation examples don't include `predictions` (classifier output), `ThresholdOptimizer` generates deterministic synthetic predictions from the `input` string:

```typescript
const dataset: EvaluationDataset = {
  examples: [
    { input: "I need to fly to Tokyo", expectedLabel: "book_flight" },
    { input: "Where is my package?", expectedLabel: "track_order" },
  ],
};

// No predictions needed — synthetic ones are generated automatically
const optimizer = new ThresholdOptimizer(router, dataset);
const result = optimizer.gridSearch();
```

### With Real Classifier Output

For more accurate evaluation, include actual classifier predictions:

```typescript
const dataset: EvaluationDataset = {
  examples: [
    {
      input: "fly to Paris tomorrow",
      expectedLabel: "book_flight",
      predictions: [
        { label: "book_flight", confidence: 0.91 },
        { label: "check_status", confidence: 0.09 },
      ],
    },
  ],
};

const optimizer = new ThresholdOptimizer(router, dataset);
const metrics = optimizer.evaluateWithCurrentThresholds();
```

### Custom Threshold Range

```typescript
const result = optimizer.gridSearch(
  [0.75, 0.80, 0.85, 0.90],  // route candidates
  [0.15, 0.20, 0.25]          // fallback candidates
);
```

## Related Packages

- [`@reaatech/confidence-router-core`](https://www.npmjs.com/package/@reaatech/confidence-router-core) — `RouterInterface`, `EvaluationDataset`, and metric types
- [`@reaatech/confidence-router`](https://www.npmjs.com/package/@reaatech/confidence-router) — Full router with `evaluate()` / `optimizeThresholds()` convenience methods

## License

[MIT](https://github.com/reaatech/confidence-router/blob/main/LICENSE)
