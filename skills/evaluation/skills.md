# Evaluation Agent

## Purpose
Build the evaluation harness and threshold optimization system in `@reaatech/confidence-router-evaluation`. Performs grid search across threshold combinations to maximize F1 score against labeled datasets.

## Capabilities

### Threshold Optimization
- Grid search across `routeThreshold` and `fallbackThreshold` combinations
- Automatic F1 score calculation for each combination
- Skip invalid combinations (`fallback >= route`)
- Always restore original thresholds after optimization (even on error)

### Metrics Calculation
- Accuracy, precision, recall, F1 score
- Confusion matrix per label
- Decision type distribution (ROUTE / CLARIFY / FALLBACK counts)
- Macro-averaged precision and recall across all classes

### Dataset Support
- Accepts `EvaluationDataset` with `LabeledExample[]`
- Works with datasets containing actual classifier predictions
- Falls back to synthetic deterministic predictions when `predictions` are absent (hash-based confidence from input string)
- Validates dataset integrity (non-empty, all examples have `input` and `expectedLabel`)

### RouterInterface Decoupling
- Accepts `RouterInterface` from core, not a concrete `ConfidenceRouter`
- Any object implementing `decide()`, `getConfig()`, `updateConfig()` is valid
- Enables independent testing without the barrel package

## Triggers
- Performance tuning requirements
- Threshold optimization for new datasets
- Metrics reporting
- A/B comparison of threshold strategies

## Dependencies
- Core Engine Agent (package: `@reaatech/confidence-router-core` for `RouterInterface`, `EvaluationDataset`, `EvaluationMetrics`)
- Project Setup Agent (for package scaffolding)

## Package Structure

```
packages/evaluation/
├── src/
│   ├── ThresholdOptimizer.ts  # Grid search + metrics calculation
│   └── index.ts               # Barrel export
├── tests/                     # Tests with MockRouter
├── package.json               # @reaatech/confidence-router-evaluation
│                              #   depends on: @reaatech/confidence-router-core
├── tsconfig.json
├── tsup.config.ts
└── vitest.config.ts
```

## Examples

### Basic Evaluation
```typescript
import { ThresholdOptimizer } from '@reaatech/confidence-router-evaluation';

const dataset: EvaluationDataset = {
  examples: [
    { input: 'book a flight', expectedLabel: 'book_flight' },
    { input: 'cancel reservation', expectedLabel: 'cancel_booking' },
  ],
};

const optimizer = new ThresholdOptimizer(router, dataset);
const metrics = optimizer.evaluateWithCurrentThresholds();

console.log(metrics.f1Score);     // 0.85
console.log(metrics.accuracy);    // 0.82
```

### Grid Search Optimization
```typescript
const optimal = optimizer.gridSearch();

console.log(optimal.routeThreshold);    // e.g., 0.75
console.log(optimal.fallbackThreshold); // e.g., 0.20
console.log(optimal.score);             // best F1 achieved

// Apply optimal thresholds
router.updateConfig({
  routeThreshold: optimal.routeThreshold,
  fallbackThreshold: optimal.fallbackThreshold,
});
```

### Custom Threshold Ranges
```typescript
const result = optimizer.gridSearch(
  [0.75, 0.80, 0.85, 0.90],  // route candidates
  [0.15, 0.20, 0.25]          // fallback candidates
);
```

### With Explicit Predictions
```typescript
const dataset: EvaluationDataset = {
  examples: [
    {
      input: 'I need to fly to Tokyo',
      expectedLabel: 'book_flight',
      predictions: [
        { label: 'book_flight', confidence: 0.91 },
      ],
    },
  ],
};
```

## Decision Type Distribution

```typescript
const metrics = optimizer.evaluateWithCurrentThresholds();
console.log(metrics.decisionsByType);
// → { ROUTE: 45, CLARIFY: 12, FALLBACK: 3 }
```

## Quality Standards

### Metric Quality
- Macro-averaged precision/recall across all classes
- Confusion matrix tracks expected vs predicted per label
- Edge cases: single-example dataset, all-same-label datasets

### Code Quality
- 100% TypeScript strict mode
- `RouterError.DATASET_INVALID` for malformed datasets
- try/finally ensures config restoration even on grid search errors

### Performance
- Grid search: O(routeCandidates × fallbackCandidates × datasetSize)
- Default: 10 × 9 × N evaluations
- Metrics calculation: single pass over decisions/actuals arrays

## Synthetic Prediction Generation

When dataset examples lack `predictions`, the optimizer generates deterministic synthetic scores:

```typescript
private hashConfidence(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.round((0.25 + (Math.abs(hash) % 1000) / 1000 * 0.7) * 100) / 100;
}
```

This produces stable scores between 0.25–0.95, ensuring grid search has meaningful variation even with raw labeled data.

## Integration Points

- **core**: Depends on `RouterInterface`, `EvaluationDataset`, `EvaluationMetrics`, `RouterError`
- **confidence-router**: Provides `evaluate()` / `optimizeThresholds()` convenience methods that wrap `ThresholdOptimizer`

---

**Agent Version**: 2.0.0
**Last Updated**: 2026-04-30
**Status**: Active
