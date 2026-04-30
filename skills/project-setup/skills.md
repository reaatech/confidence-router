# Project Setup Agent

## Purpose
Initialize and configure the confidence-router monorepo with all necessary tooling and configurations for enterprise-grade TypeScript development.

## Capabilities

### Monorepo Initialization
- Initialize pnpm workspace with `pnpm-workspace.yaml`
- Create scoped packages under `packages/*` and examples under `examples/*`
- Configure root `package.json` with `private: true`
- Set up `turbo.json` for build/test orchestration

### Package Scaffolding
- Create per-package `package.json` with dual ESM/CJS exports
- Set up per-package `tsup.config.ts` for building
- Create per-package `tsconfig.json` extending root
- Create per-package `vitest.config.ts` for testing
- Create per-package `src/` and `tests/` directories

### Code Quality Tools
- Configure Biome for lint + format (`biome.json`)
- Set up organizeImports, noExplicitAny, noNonNullAssertion rules
- Configure consistent quote style, trailing commas, indent width

### Testing Framework
- Configure Vitest 3 per package
- Set up coverage reporting with v8 provider
- Configure test matrix (Node 20 + 22) in CI
- Create example test files with descriptive naming

### Build Configuration
- Configure tsup per package (entry: src/index.ts, format: [cjs, esm], dts: true)
- Orchestrate builds via turbo (dependsOn: ^build)
- Clean output directories (`rm -rf dist`) per package

### CI/CD Pipeline
- Create `.github/workflows/ci.yml` with separated jobs (install → audit, format, lint, typecheck → build → test, coverage → all-checks)
- Create `.github/workflows/release.yml` with changesets/action for publishing
- Configure pnpm store caching with actions/cache@v4
- Set up Dependabot via `.github/dependabot.yml`

### Versioning
- Initialize Changesets with `.changeset/config.json`
- Configure GitHub changelog integration
- Set `access: public` for scoped packages
- Set `updateInternalDependencies: patch`

## Triggers
- Initial project creation
- Environment setup for new developers
- Adding a new package to the monorepo
- CI/CD pipeline configuration

## Dependencies
- None (this is typically the first agent to run)

## Configuration

### Environment Variables
```bash
NODE_VERSION=22
PACKAGE_MANAGER=pnpm@10
```

### Setup Options
```json
{
  "typescript": {
    "strict": true,
    "target": "ES2022",
    "module": "NodeNext",
    "verbatimModuleSyntax": true
  },
  "testing": {
    "framework": "vitest",
    "version": "^3.1.1",
    "coverage": true
  },
  "build": {
    "tool": "tsup",
    "orchestrator": "turbo",
    "formats": ["esm", "cjs"],
    "dts": true
  },
  "lint": {
    "tool": "biome",
    "version": "^1.9.4"
  },
  "ci": {
    "platform": "github-actions",
    "nodeVersions": [20, 22],
    "pnpmVersion": 10
  }
}
```

## Examples

### Basic Monorepo Setup
```bash
# Initialize workspace
echo 'packages:
  - '\''packages/*'\''
  - '\''examples/*'\''' > pnpm-workspace.yaml

pnpm init
pnpm add -D -w @biomejs/biome @changesets/cli @changesets/changelog-github
pnpm add -D -w @vitest/coverage-v8 turbo typescript vitest

pnpm changeset init
```

### Per-Package package.json
```json
{
  "name": "@reaatech/confidence-router-core",
  "version": "0.1.0",
  "license": "MIT",
  "author": "Rick Somers <rick@reaatech.com>",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    }
  },
  "files": ["dist"],
  "publishConfig": { "access": "public" },
  "scripts": {
    "build": "tsup",
    "test": "vitest run",
    "test:coverage": "vitest run --coverage",
    "clean": "rm -rf dist"
  },
  "devDependencies": {
    "@types/node": "^25.6.0",
    "tsup": "^8.4.0",
    "typescript": "^5.8.3",
    "vitest": "^3.1.1"
  }
}
```

### Per-Package tsconfig.json
```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"]
}
```

### Per-Package tsup.config.ts
```typescript
import { defineConfig } from 'tsup';
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
});
```

### Per-Package vitest.config.ts
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

### Root Scripts
```json
{
  "scripts": {
    "build": "turbo run build",
    "test": "turbo run test",
    "test:coverage": "turbo run test:coverage",
    "lint": "biome check .",
    "lint:fix": "biome check --write .",
    "format": "biome format --write .",
    "format:check": "biome format .",
    "typecheck": "tsc --noEmit -p tsconfig.typecheck.json",
    "clean": "turbo run clean && rm -rf node_modules",
    "changeset": "changeset",
    "version-packages": "changeset version",
    "release": "turbo run build && changeset publish"
  }
}
```

### Turbo Configuration
```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": { "dependsOn": ["^build"], "outputs": ["dist/**"] },
    "test": { "dependsOn": ["build"] },
    "test:coverage": { "dependsOn": ["build"] },
    "lint": {},
    "typecheck": { "dependsOn": ["^build"] },
    "clean": { "cache": false }
  }
}
```

### CI Workflow (ci.yml)
```yaml
name: CI
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
jobs:
  install:
    # checkout → setup pnpm → setup node → pnpm install → cache pnpm store
  audit:
    # checkout → setup → install → pnpm audit
  format:
    needs: install  # checkout → restore cache → biome format --write . && git diff --exit-code
  lint:
    needs: install  # checkout → restore cache → biome check .
  typecheck:
    needs: install  # checkout → restore cache → pnpm typecheck
  build:
    needs: [lint, typecheck]  # checkout → restore cache → pnpm build → upload artifacts
  test:
    needs: build     # matrix: node [20, 22] → download artifacts → pnpm test
  coverage:
    needs: build     # download artifacts → pnpm test:coverage → upload reports
  all-checks:
    needs: [audit, format, lint, typecheck, build, test, coverage]
    if: always()
```

### Release Workflow (release.yml)
```yaml
name: Release
on:
  push:
    branches: [main]
  workflow_dispatch:
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: false
jobs:
  release:
    permissions:
      contents: write
      pull-requests: write
      id-token: write
      packages: write
    steps:
      # checkout → pnpm → node → install → build
      # → changesets/action@v1 (with NPM_TOKEN, NPM_CONFIG_PROVENANCE)
      # → Mirror to GitHub Packages (@reaatech:registry=https://npm.pkg.github.com)
```

## Directory Structure (Final State)

```
confidence-router/
├── .changeset/config.json
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── release.yml
├── packages/
│   ├── core/             @reaatech/confidence-router-core
│   ├── classifiers/      @reaatech/confidence-router-classifiers
│   ├── languages/        @reaatech/confidence-router-languages
│   ├── evaluation/       @reaatech/confidence-router-evaluation
│   └── confidence-router/@reaatech/confidence-router
├── examples/
│   ├── basic-routing/
│   ├── built-in-classifiers/
│   ├── custom-classifier/
│   ├── evaluation/
│   └── multi-language/
├── pnpm-workspace.yaml
├── turbo.json
├── biome.json
├── tsconfig.json
├── tsconfig.typecheck.json
└── package.json (root, private: true)
```

## Quality Standards

### TypeScript Configuration
- Strict mode enabled with all individual flags
- NodeNext module/moduleResolution
- ES2022 target, verbatimModuleSyntax
- No composite project references

### Code Quality
- Biome for lint + format (single tool, no ESLint/Prettier)
- noExplicitAny and noNonNullAssertion as errors
- Consistent formatting: single quotes, trailing commas, 2-space indent

### Testing Standards
- Per-package vitest configs
- Coverage via @vitest/coverage-v8
- Test matrix: Node 20 + 22 in CI

## Error Handling

### Common Issues
1. **Dependency Conflicts**: pnpm's strict dependency resolution
2. **TypeScript Errors**: Strict config with clear error messages
3. **CI/CD Failures**: Separated job structure for fast signal
4. **Workspace Resolution**: `workspace:*` protocol for internal deps

### Recovery Strategies
- `pnpm install --frozen-lockfile` in CI for reproducibility
- Per-package `rm -rf dist` in clean script
- Turbo cache for fast rebuilds
- Biome `--write` for auto-fixing before commit

## Security Considerations

### Dependency Security
- `pnpm audit --audit-level moderate` in CI
- Dependabot weekly updates
- `strict-peer-dependencies=true` in `.npmrc`

### Code Security
- Input validation in configuration utilities
- Secure defaults (no implicit any, strict null checks)
- npm provenance for published packages

---

**Agent Version**: 2.0.0
**Last Updated**: 2026-04-30
**Status**: Active
