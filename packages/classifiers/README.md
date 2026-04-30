# @reaatech/confidence-router-classifiers

[![npm version](https://img.shields.io/npm/v/@reaatech/confidence-router-classifiers.svg)](https://www.npmjs.com/package/@reaatech/confidence-router-classifiers)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/reaatech/confidence-router/blob/main/LICENSE)
[![CI](https://img.shields.io/github/actions/workflow/status/reaatech/confidence-router/ci.yml?branch=main&label=CI)](https://github.com/reaatech/confidence-router/actions/workflows/ci.yml)

> **Status:** Pre-1.0 — APIs may change in minor versions. Pin to a specific version in production.

Pluggable classifier system for confidence-router, with built-in implementations for keyword matching, embedding similarity, and LLM-based classification. All classifiers conform to the `Classifier` interface and can be registered for fallback chain execution.

## Installation

```bash
npm install @reaatech/confidence-router-classifiers
# or
pnpm add @reaatech/confidence-router-classifiers
```

## Feature Overview

- **KeywordClassifier** — deterministic pattern matching with exact / substring / regex modes
- **EmbeddingSimilarityClassifier** — cosine similarity between input and reference vectors
- **LLMClassifier** — OpenAI and Anthropic chat completion classifiers
- **ClassifierRegistry** — named registration with default selection and automatic fallback chains
- **Pluggable architecture** — implement `Classifier` to add custom classifiers
- **Zero runtime dependencies beyond core** — uses native `fetch` (Node 18+) for LLM calls

## Quick Start

```typescript
import { KeywordClassifier, ClassifierRegistry } from "@reaatech/confidence-router-classifiers";

const classifier = new KeywordClassifier([
  { label: "book_flight", keywords: ["flight", "fly", "ticket", "plane"] },
  { label: "check_status", keywords: ["status", "check", "where", "track"] },
  { label: "cancel_booking", keywords: ["cancel", "refund", "delete"] },
]);

const result = await classifier.classify("I want to book a flight to Paris");
// result.predictions[0] → { label: "book_flight", confidence: 0.5 }
```

## Built-in Classifiers

### KeywordClassifier

Fast, deterministic pattern matching. Zero external dependencies.

```typescript
import { KeywordClassifier } from "@reaatech/confidence-router-classifiers";

const classifier = new KeywordClassifier(
  [
    { label: "book_flight", keywords: ["flight", "fly", "ticket"], weight: 1.0 },
    { label: "cancel_booking", keywords: ["cancel", "refund"], mode: "substring" },
  ],
  { name: "intent-keywords", caseSensitive: false }
);
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `name` | `string` | `"keyword"` | Classifier name for registration |
| `priority` | `number` | `1` | Priority in fallback chain |
| `enabled` | `boolean` | `true` | Whether this classifier is active |
| `caseSensitive` | `boolean` | `false` | Match keywords case-sensitively |

**Pattern modes** (`MatchMode`):

| Mode | Behavior |
|------|----------|
| `"substring"` (default) | Matches if keyword appears anywhere in the input |
| `"exact"` | Matches on word boundaries only (`\bkeyword\b`) |
| `"regex"` | Keywords are treated as regular expressions |

### EmbeddingSimilarityClassifier

Compares input embedding vectors against labeled reference vectors using cosine similarity.

```typescript
import { EmbeddingSimilarityClassifier } from "@reaatech/confidence-router-classifiers";

const classifier = new EmbeddingSimilarityClassifier(
  [
    { label: "positive", vector: [0.9, 0.1, 0.2] },
    { label: "negative", vector: [-0.8, 0.3, 0.1] },
  ],
  {
    embeddingProvider: async (text) => {
      // Call your embedding API
      return [0.8, 0.2, 0.1];
    },
  }
);
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `name` | `string` | `"embedding"` | Classifier name |
| `priority` | `number` | `1` | Priority in fallback chain |
| `enabled` | `boolean` | `true` | Whether active |
| `embeddingProvider` | `(text: string) => Promise<number[]> \| number[]` | — | Function to generate embedding vectors |

The `embeddingProvider` can also be passed at classify time via `context.embeddingProvider`.

### LLMClassifier

Uses OpenAI or Anthropic chat completions to classify input text into predefined labels.

```typescript
import { LLMClassifier } from "@reaatech/confidence-router-classifiers";

const classifier = new LLMClassifier({
  provider: "openai",
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4o-mini",
  labels: ["book_flight", "check_status", "cancel_booking"],
  timeout: 15000,
  retries: 2,
});
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `provider` | `"openai" \| "anthropic"` | (required) | LLM provider |
| `apiKey` | `string` | `process.env.OPENAI_API_KEY` / `ANTHROPIC_API_KEY` | API key |
| `model` | `string` | `"gpt-4o-mini"` / `"claude-3-haiku-20240307"` | Model to use |
| `baseUrl` | `string` | Provider default | Custom API endpoint |
| `labels` | `string[]` | (required) | Legal classification labels |
| `timeout` | `number` | `30000` | Request timeout in ms |
| `retries` | `number` | `2` | Retry attempts with exponential backoff |
| `systemPrompt` | `string` | Auto-generated | Custom system prompt |

The LLMClassifier automatically:
- Normalizes confidence to [0, 1]
- Fills missing labels with zero confidence
- Strips markdown fences from responses
- Validates that returned labels are in the allowed set

## ClassifierRegistry

Manages named classifiers with default selection and fallback chain execution.

```typescript
import { ClassifierRegistry } from "@reaatech/confidence-router-classifiers";
import { KeywordClassifier } from "@reaatech/confidence-router-classifiers";

const registry = new ClassifierRegistry();
registry.register(new KeywordClassifier([...], { name: "intents", priority: 1 }));
registry.register(new LLMClassifier({ name: "llm-backup", priority: 2, ... }));

// Classify with a specific classifier
const result = await registry.classify("book a flight", "intents");

// Run fallback chain (tries each enabled classifier in priority order)
const fallback = await registry.getFallbackChain("I want to fly");
```

| Method | Description |
|--------|-------------|
| `register(classifier)` | Adds a classifier; first enabled one becomes default |
| `get(name)` | Retrieves by name; returns `undefined` if not found |
| `classify(input, name?, context?)` | Classifies with the named or default classifier |
| `getFallbackChain(input)` | Tries each enabled classifier in priority order; returns first success |

## Custom Classifier

Implement the `Classifier` interface from `@reaatech/confidence-router-core`:

```typescript
import type { Classifier, ClassificationResult } from "@reaatech/confidence-router-core";

class CustomClassifier implements Classifier {
  name = "custom";
  type = "custom";
  enabled = true;
  priority = 1;

  async classify(input: string, context?: Record<string, unknown>): Promise<ClassificationResult> {
    return {
      predictions: [{ label: "detected_intent", confidence: 0.95 }],
    };
  }

  async validate(): Promise<boolean> {
    return true;
  }
}
```

## Related Packages

- [`@reaatech/confidence-router-core`](https://www.npmjs.com/package/@reaatech/confidence-router-core) — Type definitions and interfaces
- [`@reaatech/confidence-router`](https://www.npmjs.com/package/@reaatech/confidence-router) — Full router with all classifiers wired by default
- [`@reaatech/confidence-router-languages`](https://www.npmjs.com/package/@reaatech/confidence-router-languages) — Multi-language support

## License

[MIT](https://github.com/reaatech/confidence-router/blob/main/LICENSE)
