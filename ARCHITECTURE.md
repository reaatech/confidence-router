# Architecture: Confidence Router

## System Overview

Confidence Router is a decision engine that processes classification results with confidence scores and determines the appropriate routing action: route to the top match, request clarification, or fall back to a default handler.

The project is organized as a **pnpm-based TypeScript monorepo** with 5 publishable packages under the `@reaatech` scope, following a one-way dependency graph with no cycles.

## Monorepo Architecture

```
packages/
├── core/               @reaatech/confidence-router-core
│   Types, errors, config, DecisionEngine, DI interfaces
│   Leaf package — zero internal deps
│
├── classifiers/        @reaatech/confidence-router-classifiers
│   ClassifierRegistry, Keyword/Embedding/LLM classifiers
│   Depends on: core
│
├── languages/          @reaatech/confidence-router-languages
│   LanguageManager, PromptGenerator, 47 locale configs
│   Depends on: core
│
├── evaluation/         @reaatech/confidence-router-evaluation
│   ThresholdOptimizer (uses RouterInterface from core)
│   Depends on: core
│
└── confidence-router/  @reaatech/confidence-router
    ConfidenceRouter (DI-refactored), RouterFactory, barrel exports
    Depends on: core, classifiers, languages, evaluation
```

### Package Dependency Graph

```
         ┌──────────┐
         │   core   │  (types, errors, config, DecisionEngine)
         └────┬─────┘
    ┌─────────┼─────────┐
    ▼         ▼         ▼
┌──────┐ ┌──────┐ ┌───────────┐
│class │ │lang  │ │evaluation │
└──┬───┘ └──┬───┘ └─────┬─────┘
   │        │            │
   └────────┼────────────┘
            ▼
       ┌─────────────┐
       │ confidence-  │  (main barrel — wires all sub-packages)
       │ router       │
       └─────────────┘
```

All edges flow one way (top-down). No package depends on `confidence-router`, which is the final aggregation point. Consumers install `@reaatech/confidence-router` for the full experience, or individual sub-packages for tree-shaking.

## Core Components

### 1. `@reaatech/confidence-router-core` — Foundation

The leaf package containing all shared types, error classes, configuration utilities, and the `DecisionEngine`. Every other package depends on it.

#### Exports

| Category | Items |
|----------|-------|
| Types | `Prediction`, `ClassificationResult`, `RoutingDecision`, `DecisionType`, `RouterConfig`, `Classifier`, `LanguageConfig`, `EvaluationDataset`, `EvaluationMetrics`, and more |
| Errors | `RouterError` class with `RouterErrorType` enum (6 variants) |
| Config | `DEFAULT_CONFIG`, `validateConfig()`, `mergeConfig()` |
| Engine | `DecisionEngine` — pure-function threshold evaluator |
| DI interfaces | `RouterInterface`, `ClassifierRegistryInterface`, `LanguageManagerInterface`, `PromptGeneratorInterface`, `ConfidenceRouterDeps` |

#### Decision Logic

```
score >= routeThreshold    →  ROUTE
score <  fallbackThreshold →  FALLBACK
otherwise (clarify enabled) →  CLARIFY
otherwise                   →  FALLBACK
```

The `DecisionEngine` is a stateless evaluator: receive a `ClassificationResult`, return a `RoutingDecision`. It performs full validation — empty predictions arrays, out-of-range confidence values, and missing labels all throw typed `RouterError` instances.

### 2. `@reaatech/confidence-router-classifiers` — Pluggable Classifiers

Three built-in classifiers and a registry for fallback chain execution.

| Classifier | Type | Approach |
|------------|------|----------|
| `KeywordClassifier` | Deterministic | Pattern matching (substring, exact, regex) with weighted scoring |
| `EmbeddingSimilarityClassifier` | Vector | Cosine similarity between input and reference embeddings |
| `LLMClassifier` | LLM API | OpenAI or Anthropic chat completions with JSON structured output |

All classifiers implement the `Classifier` interface from core:

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

The `ClassifierRegistry` provides:
- **Named registration** — classifiers are keyed by name, first enabled one is default
- **Fallback chains** — tries each classifier in priority order until one succeeds
- **Typed error propagation** — if all fail, a `RouterError` with `CLASSIFIER_NOT_FOUND` code surfaces the full chain of failures

### 3. `@reaatech/confidence-router-languages` — Multi-Language Support

47 built-in locale configurations (Afrikaans to Zulu) with localized clarification prompt templates and formatting conventions.

| Component | Role |
|-----------|------|
| `LanguageManager` | Registry of `LanguageConfig` objects, English fallback, custom language support |
| `PromptGenerator` | Formats `{options}` template strings with locale-aware separators, conjunctions, and RTL handling |
| `configs/*.ts` | 47 static config files, each exporting a `LanguageConfig` |

Each `LanguageConfig` includes:
- ISO 639-1 code, native name, direction (`ltr` / `rtl`)
- Clarification templates with `{options}` placeholder
- Locale-specific list separators (`", "` vs `"、"`) and conjunctions (`"or"` vs `"还是"`)

### 4. `@reaatech/confidence-router-evaluation` — Threshold Optimization

`ThresholdOptimizer` performs grid search across threshold combinations to maximize F1 score against labeled datasets.

```typescript
class ThresholdOptimizer {
  constructor(router: RouterInterface, dataset: EvaluationDataset);
  evaluateWithCurrentThresholds(): EvaluationMetrics;
  gridSearch(routeThresholds?, fallbackThresholds?): OptimizedThresholds;
}
```

Key design: accepts a `RouterInterface` (from core), not a concrete `ConfidenceRouter`. This decouples evaluation from the barrel package. Any object implementing `decide()`, `getConfig()`, and `updateConfig()` is valid.

The optimizer:
1. Iterates route/fallback threshold combinations (default: 10 × 9 grid)
2. Skips invalid pairs (`fallback >= route`)
3. Scores each combination by F1
4. Always restores original thresholds (even on error)

When evaluation examples lack `predictions`, synthetic deterministic scores are generated from the input string hash — ensuring grid search has meaningful variation even with raw labeled data.

### 5. `@reaatech/confidence-router` — Main Barrel

The entry point most consumers install. Bundles all sub-packages and wires them with sensible defaults.

#### ConfidenceRouter

```typescript
class ConfidenceRouter {
  constructor(config?: Partial<RouterConfig>, deps?: ConfidenceRouterDeps);

  // Decision methods
  decide(classification: ClassificationResult): RoutingDecision;
  decideBatch(classifications: ClassificationResult[]): RoutingDecision[];

  // Classification methods
  classify(input: string, classifierName?, context?): Promise<ClassificationResult>;
  process(input: string, classifierName?): Promise<RoutingDecision>;
  classifyWithFallback(input: string): Promise<ClassificationResult>;

  // Configuration
  updateConfig(config: Partial<RouterConfig>): void;
  getConfig(): RouterConfig;

  // Classifier management
  registerClassifier(classifier: Classifier): void;
  getClassifier(name: string): Classifier | undefined;

  // Evaluation
  evaluate(dataset: EvaluationDataset): EvaluationMetrics;
  optimizeThresholds(dataset: EvaluationDataset, routeThresholds?, fallbackThresholds?): OptimizedThresholds;
}
```

#### Dependency Injection

The constructor accepts optional `ConfidenceRouterDeps` to override any internal component:

```typescript
interface ConfidenceRouterDeps {
  languageManager?: LanguageManagerInterface;
  promptGenerator?: PromptGeneratorInterface;
  classifierRegistry?: ClassifierRegistryInterface;
}
```

When omitted, defaults wire concrete implementations from the sub-packages. This enables:
- Swapping language backends without touching classifier logic
- Injecting mocks for testing
- Replacing individual components in production without forking

#### RouterFactory

```typescript
const router = RouterFactory.create({ routeThreshold: 0.9 });
const defaultRouter = RouterFactory.createWithDefaults();
```

A thin factory wrapping `new ConfidenceRouter(...)`.

## Data Flow

### Routing Decision Flow

```
Input Text
    │
    ▼
┌─────────────┐
│ Classifier   │  → ClassificationResult { predictions: [...] }
└──────┬──────┘
       │
       ▼
┌──────────────┐
│ DecisionEngine│ → threshold evaluation on top prediction
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────────────┐
│  ROUTE      │   CLARIFY     │   FALLBACK │
│  score≥0.8  │   0.3≤x<0.8  │   score<0.3│
└─────────────┴───────────────┴────────────┘
                            │
                    ┌───────▼───────┐
                    │ PromptGenerator│ → localized clarification prompt
                    └───────────────┘
```

### Clarification Prompt Flow

```
ClassificationResult
    │
    ▼
Top N predictions (default: 3) sorted by confidence
    │
    ▼
LanguageManager.getLanguage(locale) → LanguageConfig
    │
    ▼
PromptGenerator.formatOptions(predictions, language)
    ├── Uses locale-specific listSeparator ("," vs "、")
    ├── Uses locale-specific conjunction ("or" vs "还是")
    └── Handles RTL direction for Arabic, Hebrew, Persian, Urdu
    │
    ▼
Template interpolation: "Did you mean: {options}?"
    └── returns localized prompt string
```

## Monorepo Toolchain

### Build Pipeline

```
pnpm build → turbo run build
                  │
      ┌───────────┼───────────┐
      ▼           ▼           ▼
   core:build  → class:build → router:build
              → lang:build
              → eval:build
```

turbo orchestrates topological builds: core first (leaf), then classifiers/languages/evaluation in parallel (all depend on core), then confidence-router last (depends on all). Output is `dist/index.js` (ESM) + `dist/index.cjs` (CJS) + `dist/index.d.ts` (types) per package.

### Testing

```
pnpm test → turbo run test → vitest run per package
```

Tests live in `packages/*/tests/`. Each package has its own `vitest.config.ts` with coverage reporting. Cross-package test dependencies are declared as `devDependencies` via `workspace:*`.

### Linting & Type Checking

- **Biome**: Single binary for lint + format (replaces ESLint + Prettier). Config in `biome.json`.
- **Types**: `tsconfig.typecheck.json` uses path aliases to resolve `@reaatech/confidence-router-*` to `packages/*/src/index.ts`, enabling cross-package typecheck without building first.

## Error Handling Strategy

### Error Hierarchy

```
RouterError (extends Error)
  ├── RouterErrorType.CONFIGURATION_ERROR
  ├── RouterErrorType.CLASSIFICATION_ERROR
  ├── RouterErrorType.LANGUAGE_NOT_SUPPORTED
  ├── RouterErrorType.THRESHOLD_INVALID
  ├── RouterErrorType.CLASSIFIER_NOT_FOUND
  └── RouterErrorType.DATASET_INVALID
```

All errors carry `type: RouterErrorType`, `message: string`, and optional `details?: Record<string, unknown>`.

### Error Recovery

| Scenario | Recovery |
|----------|----------|
| Unsupported language code | Falls back to English (`"en"`) |
| Invalid classifier output | `RouterError` with descriptive message |
| All classifiers fail (fallback chain) | `RouterError` with `{ attempts: [...failures] }` |
| Invalid configuration thresholds | Throws on construction, must be fixed before use |

## Release Pipeline

```
GitHub Actions release.yml
    │
    ▼
changesets/action@v1
    ├── No pending changesets → Publish
    └── Pending changesets → Open "Version Packages" PR
                           │
                           ▼
                    Merge PR → Publish to npm + mirror to GitHub Packages
```

- **npm**: Published via `NPM_TOKEN` secret to `registry.npmjs.org`
- **GitHub Packages**: Mirrored via `GITHUB_TOKEN` to `npm.pkg.github.com`
- **Provenance**: Enabled via `NPM_CONFIG_PROVENANCE: 'true'`

## Performance Considerations

| Target | Value |
|--------|-------|
| Decision time (core engine) | < 1ms per evaluation |
| Keyword classifier | < 1ms per classification |
| Embedding classifier | < 10ms (depends on provider) |
| LLM classifier | API-dependent (500ms–2s) |
| Bundle size (per package) | < 20KB gzipped |
| Language loading | < 10ms for 47-locale init |

## Package Dependency Rules

| Package | Internal Dependencies | Runtime Dependencies |
|---------|----------------------|---------------------|
| `core` | none | none |
| `classifiers` | `core` (types + errors) | none (uses native `fetch`) |
| `languages` | `core` (types + errors) | none |
| `evaluation` | `core` (types + errors + RouterInterface) | none |
| `confidence-router` | `core`, `classifiers`, `languages`, `evaluation` | none |

The entire ecosystem has zero external runtime dependencies beyond Node.js built-ins. The LLM classifier uses native `fetch` (Node 18+).

## Directory Reference

```
packages/core/src/
  types/index.ts          # All type definitions + DI interfaces
  types/errors.ts         # RouterError class + RouterErrorType enum
  config/index.ts         # DEFAULT_CONFIG, validateConfig, mergeConfig
  DecisionEngine.ts       # Core threshold evaluation engine
  index.ts                # Barrel export

packages/classifiers/src/
  ClassifierRegistry.ts   # Named registration + fallback chains
  KeywordClassifier.ts    # Pattern-matching classifier
  EmbeddingSimilarityClassifier.ts  # Cosine similarity classifier
  LLMClassifier.ts        # OpenAI + Anthropic LLM classifier
  index.ts                # Barrel export

packages/languages/src/
  LanguageManager.ts      # 47-locale registry with English fallback
  PromptGenerator.ts      # Template interpolation with locale formatting
  configs/*.ts            # 47 static language config files
  index.ts                # Barrel export

packages/evaluation/src/
  ThresholdOptimizer.ts   # Grid search + metrics calculation
  index.ts                # Barrel export

packages/confidence-router/src/
  ConfidenceRouter.ts     # DI-refactored main router class
  RouterFactory.ts        # Factory functions
  index.ts                # Full barrel re-exporting all sub-packages
```

## License

[MIT](LICENSE)

---

**Last Updated**: 2026-04-30
**Version**: 2.0.0
**Status**: Active Development — Monorepo with 5 packages, 10 workspaces
