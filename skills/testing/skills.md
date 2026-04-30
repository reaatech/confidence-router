# Testing Agent

## Purpose
Implement a comprehensive testing strategy across all packages in the monorepo, ensuring high quality and reliability through per-package vitest configurations, unit tests, integration tests, and coverage reporting.

## Capabilities

### Test Framework Management
- Per-package `vitest.config.ts` with consistent configuration
- Coverage reporting via `@vitest/coverage-v8` with `text` + `json-summary` reporters
- Test orchestration via `turbo run test` (builds dependencies first)
- CI test matrix across Node 20 and 22

### Unit Testing
- Write unit tests for all exported functions and classes
- Test decision paths (ROUTE, CLARIFY, FALLBACK) individually
- Cover edge cases: invalid inputs, boundary values, empty arrays
- Mock external APIs (fetch, LLM endpoints)

### Integration Testing
- Test cross-package interactions (classifier → registry → router)
- Test fallback chain behavior with multiple classifiers
- Test locale-aware prompt generation with multiple languages
- Test threshold optimization with real router instances

### Test Structure

```
packages/core/tests/
  ├── DecisionEngine.test.ts
  ├── DecisionEngine.edge.test.ts
  ├── config.test.ts
  └── RouterError.test.ts

packages/classifiers/tests/
  ├── ClassifierRegistry.test.ts
  ├── KeywordClassifier.test.ts
  ├── EmbeddingSimilarityClassifier.test.ts
  └── LLMClassifier.test.ts

packages/languages/tests/
  ├── LanguageManager.test.ts
  └── PromptGenerator.test.ts

packages/evaluation/tests/
  └── ThresholdOptimizer.test.ts    # Uses MockRouter

packages/confidence-router/tests/
  ├── ConfidenceRouter.test.ts
  ├── RouterFactory.test.ts
  ├── RouterIntegration.test.ts
  ├── BuiltInClassifiersIntegration.test.ts
  ├── ThresholdOptimizer.test.ts    # Full integration test
  └── index.test.ts                 # Barrel export sanity check
```

## Triggers
- Test development requirements
- New feature implementation
- Bug fixes (add regression test)
- Coverage threshold maintenance

## Dependencies
- Project Setup Agent (for vitest configs)
- All other agents (for feature testing)

## Per-Package vitest.config.ts

```typescript
import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    globals: false,
    environment: 'node',
    coverage: {
      reporter: ['text', 'json-summary'],
    },
  },
});
```

## Examples

### Unit Test (DecisionEngine)
```typescript
import { describe, it, expect } from 'vitest';
import { DecisionEngine, mergeConfig } from '../src/index.js';

describe('DecisionEngine', () => {
  it('routes high-confidence predictions', () => {
    const engine = new DecisionEngine(mergeConfig({
      routeThreshold: 0.8,
      fallbackThreshold: 0.3,
    }));

    const decision = engine.decide({
      predictions: [{ label: 'book', confidence: 0.92 }],
    });

    expect(decision.type).toBe('ROUTE');
    expect(decision.target).toBe('book');
  });

  it('returns FALLBACK for low confidence', () => {
    const engine = new DecisionEngine(mergeConfig({
      routeThreshold: 0.8,
      fallbackThreshold: 0.3,
    }));

    const decision = engine.decide({
      predictions: [{ label: 'book', confidence: 0.1 }],
    });

    expect(decision.type).toBe('FALLBACK');
  });
});
```

### Integration Test (Router + Classifiers)
```typescript
import { describe, it, expect } from 'vitest';
import { ConfidenceRouter } from '../src/ConfidenceRouter.js';
import { KeywordClassifier } from '@reaatech/confidence-router-classifiers';

describe('Router + KeywordClassifier integration', () => {
  it('routes after classification', async () => {
    const router = new ConfidenceRouter();
    router.registerClassifier(new KeywordClassifier([
      { label: 'book', keywords: ['book', 'flight'] },
    ]));

    const decision = await router.process('I want to book a flight');
    expect(decision.type).toBe('ROUTE');
  });
});
```

### Mock LLM API (fetch mocking)
```typescript
it('classifies via OpenAI API', async () => {
  globalThis.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: () => ({
      choices: [{
        message: {
          content: JSON.stringify({
            predictions: [{ label: 'book_flight', confidence: 0.9 }],
          }),
        },
      }],
    }),
  });

  const classifier = new LLMClassifier({
    provider: 'openai',
    apiKey: 'test',
    labels: ['book_flight'],
  });

  const result = await classifier.classify('book a flight');
  expect(result.predictions[0].confidence).toBe(0.9);
});
```

## Quality Standards

### Coverage Goals
- Statement coverage: ≥ 95%
- Branch coverage: ≥ 90%
- Function coverage: ≥ 95%
- Line coverage: ≥ 95%

### Test Organization
| Layer | Location | Purpose |
|-------|----------|---------|
| Unit | `packages/*/tests/` | Test single functions/classes in isolation |
| Integration | `packages/*/tests/` | Test interactions between package components |
| Cross-package | `packages/confidence-router/tests/` | Test wired-up barrel package end-to-end |

### Test CI Flow
```
install → format → lint → typecheck → build → test (matrix: 20, 22) → coverage → all-checks
```

## Performance
- Test execution: < 5s for full suite (excluding LLM tests with real delays)
- LLM tests use mock fetch, not real API calls
- Turbo caching prevents redundant builds between test runs

---

**Agent Version**: 2.0.0
**Last Updated**: 2026-04-30
**Status**: Active
