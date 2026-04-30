# Documentation Agent

## Purpose
Generate and maintain comprehensive documentation for the confidence-router monorepo, including per-package READMEs with API references, the root README, architecture documentation, and contributing guides.

## Capabilities

### Package READMEs
- Write per-package `README.md` files in the A2A-reference-ts format
- Include npm version, license, and CI badges
- Document all exported types, classes, and functions with tables
- Provide quick-start code examples
- Link to related sibling packages

### Root README
- Maintain monorepo-level README with package table
- Document installation for all packages
- Provide ecosystem-level quick start example
- Link to examples and documentation

### Architecture Documentation
- Maintain `ARCHITECTURE.md` with system overview
- Document package dependency graph
- Describe data flows (routing decision flow, clarification prompt flow)
- Document monorepo toolchain (pnpm, turbo, Biome, tsup, vitest, Changesets)

### Agent Skills Documentation
- Maintain `AGENTS.md` with skill descriptions and workflow diagram
- Document monorepo conventions and toolchain
- Update collaboration workflows as packages evolve

### Contributing & Release Documentation
- Maintain `CONTRIBUTING.md` with development workflow
- Maintain publishing documentation linked from the root README
- Document Changesets workflow for versioning

## Triggers
- Documentation updates after API changes
- New package addition
- Release workflow changes
- README quality audits

## Dependencies
- All other agents (documents their outputs)
- Core Engine Agent (for accurate type/API references)

## Documentation File Map

```
confidence-router/
├── README.md              # Root: badges, features, install, packages table, quick start
├── ARCHITECTURE.md        # System design, package deps, data flows, toolchain
├── AGENTS.md              # Agent skill system overview
├── CONTRIBUTING.md        # Contribution workflow
└── packages/
    ├── core/README.md              # Types, errors, config, DecisionEngine, DI interfaces
    ├── classifiers/README.md       # 3 classifiers + registry, custom classifier guide
    ├── languages/README.md         # 47-locale table, LanguageManager, PromptGenerator
    ├── evaluation/README.md        # ThresholdOptimizer, grid search, metrics
    └── confidence-router/README.md # ConfidenceRouter, RouterFactory, decision tree
```

## README Template (Per-Package)

```markdown
# @reaatech/confidence-router-{name}

[![npm version](...)](https://www.npmjs.com/package/@reaatech/confidence-router-{name})
[![License: MIT](...)](...)
[![CI](...)](...)

> **Status:** Pre-1.0 — APIs may change in minor versions. Pin to a specific version in production.

One-line description.

## Installation
```bash
npm install @reaatech/confidence-router-{name}
pnpm add @reaatech/confidence-router-{name}
```

## Feature Overview
- **Feature 1** — description
- **Feature 2** — description

## Quick Start
```typescript
import { ... } from '@reaatech/confidence-router-{name}';
```

## API Reference
### Exported Types
| Export | Description |
|--------|-------------|
| ... | ... |

### Methods
| Method | Returns | Description |
|--------|---------|-------------|
| ... | ... | ... |

## Usage Patterns
### Pattern Name
```typescript
// code example
```

## Related Packages
- [`@reaatech/confidence-router-{other}`](...) — description

## License
[MIT](...)
```

## Quality Standards

### Documentation Quality
- Every exported type/function documented in README
- Working code examples in all quick starts
- Cross-package links for related packages

### Consistency
- All READMEs follow the same structure
- Badge formatting identical across packages
- Status banner on all package READMEs
- Node version requirements clearly stated

---

**Agent Version**: 2.0.0
**Last Updated**: 2026-04-30
**Status**: Active
