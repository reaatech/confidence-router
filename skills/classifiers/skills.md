# Classifier Agent

## Purpose
Implement the pluggable classifier system in `@reaatech/confidence-router-classifiers`, including three built-in classifier types (keyword, embedding similarity, LLM) and a registry with prioritized fallback chain execution.

## Capabilities

### Classifier Architecture
- Implement `Classifier` interface from `@reaatech/confidence-router-core`
- Create `ClassifierRegistry` for named registration and fallback chains
- Support classifier priority ordering and enable/disable toggling

### Built-in Classifiers

#### KeywordClassifier
- Pattern matching with `substring`, `exact` (word boundary), and `regex` modes
- Weighted keyword scoring: `confidence = min(1, matches/keywords * weight)`
- Case-sensitive mode support
- Duplicate label detection and config validation

#### EmbeddingSimilarityClassifier
- Cosine similarity between input embedding and reference vectors
- Pluggable `embeddingProvider` (constructor or context)
- Vector dimension validation
- Sorted predictions by similarity score

#### LLMClassifier
- OpenAI and Anthropic chat completions via native `fetch` (no SDKs)
- JSON structured output with `{ predictions: [{ label, confidence }] }` format
- Exponential backoff retry (configurable attempts)
- Markdown fence stripping, label validation, confidence clamping to [0,1]
- API key resolution: constructor option → `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` env var

### Classifier Registry
- Named classifier registration; first enabled classifier becomes default
- `classify(input, name?, context?)` — direct or default classifier invocation
- `getFallbackChain(input)` — tries all enabled classifiers in priority order
- Full error chain reporting when all classifiers fail

## Triggers
- Classifier integration requirements
- Adding a new classifier type
- Performance optimization of existing classifiers
- Fallback chain configuration

## Dependencies
- Core Engine Agent (package: `@reaatech/confidence-router-core` for types/errors)
- Project Setup Agent (for package scaffolding)

## Package Structure

```
packages/classifiers/
├── src/
│   ├── ClassifierRegistry.ts        # Registry + fallback chain
│   ├── KeywordClassifier.ts         # Pattern-matching classifier
│   ├── EmbeddingSimilarityClassifier.ts  # Cosine similarity classifier
│   ├── LLMClassifier.ts             # OpenAI + Anthropic LLM classifier
│   └── index.ts                     # Barrel export
├── tests/                           # Per-classifier test files
├── package.json                     # @reaatech/confidence-router-classifiers
│                                    #   depends on: @reaatech/confidence-router-core
├── tsconfig.json
├── tsup.config.ts
└── vitest.config.ts
```

## Examples

### Classifier Interface (from core)
```typescript
interface Classifier {
  name: string;
  type: string;
  enabled: boolean;
  priority: number;
  classify(input: string, context?: Record<string, unknown>): Promise<ClassificationResult>;
  validate?(): Promise<boolean>;
}
```

### KeywordClassifier
```typescript
import { KeywordClassifier } from '@reaatech/confidence-router-classifiers';

const classifier = new KeywordClassifier([
  { label: 'book_flight', keywords: ['flight', 'fly', 'ticket'], weight: 1.0 },
  { label: 'cancel_booking', keywords: ['cancel', 'refund'], mode: 'substring' },
]);

const result = await classifier.classify('I want to book a flight');
// result.predictions[0] → { label: 'book_flight', confidence: 0.33 }
```

### LLMClassifier
```typescript
import { LLMClassifier } from '@reaatech/confidence-router-classifiers';

const classifier = new LLMClassifier({
  provider: 'openai',
  apiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-4o-mini',
  labels: ['book_flight', 'check_status', 'cancel_booking'],
  timeout: 15000,
  retries: 2,
});
```

### Fallback Chain
```typescript
import { ClassifierRegistry, KeywordClassifier, LLMClassifier } from '@reaatech/confidence-router-classifiers';

const registry = new ClassifierRegistry();
registry.register(new KeywordClassifier(patterns, { priority: 1 }));
registry.register(new LLMClassifier(llmConfig, { priority: 2 }));

// Tries keyword first, falls back to LLM on failure
const result = await registry.getFallbackChain('I need help');
```

## Quality Standards

### Classifier Quality
- All classifiers implement the `Classifier` interface from core
- Confidence scores normalized to [0, 1]
- Config validation throws `RouterError` with descriptive messages

### Performance
- KeywordClassifier: < 1ms per classification
- EmbeddingSimilarityClassifier: provider-dependent
- LLMClassifier: API-dependent (500ms–2s) with configurable timeout

### Testing
- Per-classifier unit tests covering all modes/configurations
- Edge cases: empty patterns, duplicate labels, invalid vectors, API errors
- LLMClassifier tests use `globalThis.fetch` mocking (no real API calls)

## Error Handling

All classifiers throw `RouterError` from core with appropriate `RouterErrorType`:
- `CONFIGURATION_ERROR` — invalid patterns, missing labels, duplicate configs
- `CLASSIFICATION_ERROR` — invalid API responses, bad JSON, unknown labels
- `CLASSIFIER_NOT_FOUND` — registry lookup failures

Fallback chain errors include `{ attempts: [{ classifier, error }] }` in the `details` field.

## Integration Points

- **core**: Depends on `Classifier`, `ClassificationResult`, `RouterError`, `RouterErrorType`
- **confidence-router**: Uses `ClassifierRegistry` + all classifiers via barrel package

---

**Agent Version**: 2.0.0
**Last Updated**: 2026-04-30
**Status**: Active
