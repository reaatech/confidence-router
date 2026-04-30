# Core Engine Agent

## Purpose
Implement the decision engine, routing logic, type system, and configuration management in `@reaatech/confidence-router-core`. This is the foundation package — all other packages depend on it.

## Capabilities

### Decision Engine Implementation
- Implement `DecisionEngine` class with threshold evaluation
- Create threshold comparison logic: `score >= route → ROUTE`, `score < fallback → FALLBACK`, otherwise `CLARIFY`
- Validate classification inputs (non-empty predictions, confidence in [0,1])
- Return typed `RoutingDecision` objects

### Type System Design
- Define all public interfaces: `Prediction`, `ClassificationResult`, `RoutingDecision`, `RouterConfig`
- Create DI interfaces: `RouterInterface`, `ClassifierRegistryInterface`, `LanguageManagerInterface`, `PromptGeneratorInterface`, `ConfidenceRouterDeps`
- Define error hierarchy: `RouterError` class + `RouterErrorType` enum (6 variants)

### Configuration System
- Implement `DEFAULT_CONFIG` with sensible defaults (routeThreshold: 0.8, fallbackThreshold: 0.3)
- Create `validateConfig()` to enforce `fallbackThreshold < routeThreshold` and [0,1] bounds
- Create `mergeConfig()` for partial configuration merging

### Package Architecture

```
packages/core/
├── src/
│   ├── types/
│   │   ├── index.ts      # All type definitions + DI interfaces
│   │   └── errors.ts     # RouterError class
│   ├── config/
│   │   └── index.ts      # DEFAULT_CONFIG, validateConfig, mergeConfig
│   ├── DecisionEngine.ts # Core threshold evaluation engine
│   └── index.ts          # Barrel export
├── tests/                # Unit tests
├── package.json          # @reaatech/confidence-router-core
├── tsconfig.json
├── tsup.config.ts
└── vitest.config.ts
```

## Triggers
- Core functionality development
- Algorithm implementation
- Adding new types or interfaces
- Configuration system changes

## Dependencies
- Project Setup Agent (for package scaffolding)
- Testing Agent (for test implementation)

## Configuration

### Default Thresholds
```typescript
const DEFAULT_CONFIG: RouterConfig = {
  routeThreshold: 0.8,
  fallbackThreshold: 0.3,
  clarificationEnabled: true,
  clarificationLanguages: ['en'],
  maxClarificationOptions: 3,
};
```

### Error Types
```typescript
enum RouterErrorType {
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR',
  CLASSIFICATION_ERROR = 'CLASSIFICATION_ERROR',
  LANGUAGE_NOT_SUPPORTED = 'LANGUAGE_NOT_SUPPORTED',
  THRESHOLD_INVALID = 'THRESHOLD_INVALID',
  CLASSIFIER_NOT_FOUND = 'CLASSIFIER_NOT_FOUND',
  DATASET_INVALID = 'DATASET_INVALID',
}
```

## Examples

### DecisionEngine
```typescript
import { DecisionEngine, mergeConfig } from '@reaatech/confidence-router-core';

const engine = new DecisionEngine(mergeConfig({ routeThreshold: 0.8, fallbackThreshold: 0.3 }));

const decision = engine.decide({
  predictions: [
    { label: 'book_flight', confidence: 0.92 },
    { label: 'check_status', confidence: 0.08 },
  ],
});
// → { type: 'ROUTE', target: 'book_flight', confidence: 0.92 }
```

### Dependency Injection Interface
```typescript
import type {
  RouterInterface,
  ClassifierRegistryInterface,
  ConfidenceRouterDeps,
} from '@reaatech/confidence-router-core';

// RouterInterface enables evaluation to work without importing ConfidenceRouter
class ThresholdOptimizer {
  constructor(private router: RouterInterface, private dataset: EvaluationDataset) {}
}

// ConfidenceRouterDeps allows swapping internal components
const deps: ConfidenceRouterDeps = {
  languageManager: new CustomLanguageManager(),
  classifierRegistry: new CustomRegistry(),
};
```

### Config Validation
```typescript
import { validateConfig, mergeConfig } from '@reaatech/confidence-router-core';

// Throws RouterError with THRESHOLD_INVALID if fallback >= route
validateConfig({ routeThreshold: 0.3, fallbackThreshold: 0.8 });

// Throws if thresholds outside [0,1]
validateConfig({ routeThreshold: 1.5, fallbackThreshold: 0.3 });
```

## Output Artifacts

The core package produces `dist/index.cjs` + `dist/index.js` + `dist/index.d.ts` containing all exported types, the `DecisionEngine` class, `RouterError`, and configuration utilities. It has zero runtime dependencies.

## Quality Standards

### Code Quality
- 100% TypeScript strict mode compliance (all individual strict flags)
- Comprehensive input validation with typed errors
- Clear separation between types, engine, and config

### Performance
- Decision time < 1ms (pure CPU, no I/O)
- Zero memory allocations beyond the returned object
- Engine is stateless — no caching required

### Testing
- Unit tests for all decision paths (ROUTE, CLARIFY, FALLBACK)
- Edge cases: empty predictions, out-of-range confidence, threshold boundaries
- Config validation: invalid ranges, inconsistent thresholds

## Integration Points

### With Other Packages
- **classifiers**: Depends on core for `Classifier` interface, `ClassificationResult`, `RouterError`
- **languages**: Depends on core for `LanguageConfig`, `Prediction`, `RouterError`
- **evaluation**: Depends on core for `RouterInterface`, `EvaluationDataset`, `EvaluationMetrics`
- **confidence-router**: Depends on core for all types + DI interfaces + DecisionEngine

### Package Dependency
```
core (leaf — zero internal deps)
  ↑
  ├── classifiers
  ├── languages
  ├── evaluation
  └── confidence-router (depends on all above)
```

---

**Agent Version**: 2.0.0
**Last Updated**: 2026-04-30
**Status**: Active
