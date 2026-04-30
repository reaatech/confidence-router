# confidence-router

[![CI](https://github.com/reaatech/confidence-router/actions/workflows/ci.yml/badge.svg)](https://github.com/reaatech/confidence-router/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)

> A lightweight, pluggable routing engine that converts classification uncertainty into intelligent decisions — route, clarify, or fallback.

This monorepo provides core types, a decision engine, pluggable classifiers, multi-language support, and evaluation tooling for building confidence-aware routing systems.

## Features

- **Decision engine** — threshold-based routing with ROUTE / CLARIFY / FALLBACK decision boundaries
- **Pluggable classifiers** — keyword matching, embedding similarity, and LLM-based (OpenAI/Anthropic) classifiers
- **Multi-language support** — 47 built-in locales with localized clarification prompt templates
- **Threshold optimization** — grid search evaluation harness with accuracy, precision, recall, and F1 metrics
- **Fallback chains** — automatic classifier chaining in priority order with robust error handling
- **Zero external runtime dependencies** — uses native `fetch` for LLM calls, no SDK bloat
- **Dual ESM/CJS output** — works with `import` and `require`

## Installation

### Using the packages

Packages are published under the `@reaatech` scope and can be installed individually:

```bash
# Main entry point (all batteries included)
pnpm add @reaatech/confidence-router

# Core types, config, errors, and DecisionEngine
pnpm add @reaatech/confidence-router-core

# Built-in classifier implementations
pnpm add @reaatech/confidence-router-classifiers

# Multi-language support (47 locales)
pnpm add @reaatech/confidence-router-languages

# Threshold optimization and evaluation
pnpm add @reaatech/confidence-router-evaluation
```

### Contributing

```bash
# Clone the repository
git clone https://github.com/reaatech/confidence-router.git
cd confidence-router

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run the test suite
pnpm test

# Run linting
pnpm lint
```

## Quick Start

```typescript
import { ConfidenceRouter, KeywordClassifier } from "@reaatech/confidence-router";

const router = new ConfidenceRouter({
  routeThreshold: 0.8,
  fallbackThreshold: 0.3,
  clarificationEnabled: true,
});

router.registerClassifier(new KeywordClassifier([
  { label: "book_flight", keywords: ["flight", "fly", "ticket"] },
  { label: "cancel_booking", keywords: ["cancel", "refund"] },
]));

const decision = await router.process("I want to book a flight to Paris");
console.log(decision.type);  // "ROUTE"
console.log(decision.target); // "book_flight"
```

See the [`examples/`](./examples/) directory for complete working samples, including built-in classifier usage, custom classifiers, multi-language prompts, and threshold optimization.

## Packages

| Package | Description |
| ------- | ----------- |
| [`@reaatech/confidence-router`](./packages/confidence-router) | Main entry point — routers, factory, barrel exports |
| [`@reaatech/confidence-router-core`](./packages/core) | Core types, errors, config, and DecisionEngine |
| [`@reaatech/confidence-router-classifiers`](./packages/classifiers) | Pluggable classifier implementations (keyword, embedding, LLM) |
| [`@reaatech/confidence-router-languages`](./packages/languages) | Multi-language support with 47 built-in locales |
| [`@reaatech/confidence-router-evaluation`](./packages/evaluation) | Threshold optimization and evaluation harness |

## Documentation

- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — System design, package relationships, and data flows
- [`AGENTS.md`](./AGENTS.md) — AI agent skills configuration and development guidelines
- [`CONTRIBUTING.md`](./CONTRIBUTING.md) — Contribution workflow and release process

## License

[MIT](LICENSE)
