# DevOps Agent

## Purpose
Handle CI/CD infrastructure, release automation, and deployment configuration for the confidence-router monorepo. Manages GitHub Actions workflows, Changesets publishing, npm + GitHub Packages dual registry, and Dependabot configuration.

## Capabilities

### CI/CD Pipeline
- Configure `.github/workflows/ci.yml` with separated job structure
- Set up pnpm store caching with `actions/cache@v4`
- Configure test matrix across Node 20 and 22
- Implement `all-checks` gate job for branch protection

### Release Automation
- Configure `.github/workflows/release.yml` with `changesets/action@v1`
- Set up npm publishing via `NPM_TOKEN` secret
- Set up GitHub Packages mirror via `GITHUB_TOKEN`
- Enable npm provenance with `NPM_CONFIG_PROVENANCE: 'true'`
- Tag `push: branches: [main]` trigger after first manual publish

### Changesets Configuration
- Configure `.changeset/config.json` with `access: public`
- Set up `@changesets/changelog-github` for PR-linked changelogs
- Configure `updateInternalDependencies: patch`
- Manage `workspace:*` protocol for internal deps

### Dependency Management
- Configure `.github/dependabot.yml` for weekly npm updates
- Set up GitHub Actions version updates
- Configure versioning strategy and reviewer assignment

### Repository Configuration
- Maintain `.npmrc` with `shamefully-hoist=false` and `strict-peer-dependencies=true`
- Maintain `.gitignore` with build artifact patterns
- Configure `packageManager` field for pnpm version pinning

## Workflow Architecture

### CI Pipeline (`ci.yml`)

```
install (pnpm install + cache pnpm store)
    ├── audit (pnpm audit --audit-level moderate) [parallel, no dep]
    ├── format (biome format --write . && git diff --exit-code) [needs: install]
    ├── lint (biome check .) [needs: install]
    └── typecheck (tsc --noEmit -p tsconfig.typecheck.json) [needs: install]
            └── build (pnpm build → upload artifacts) [needs: lint, typecheck]
                    ├── test (matrix: [20, 22], download artifacts) [needs: build]
                    └── coverage (download artifacts → pnpm test:coverage → upload reports → post summary) [needs: build]

all-checks (needs: audit, format, lint, typecheck, build, test, coverage) [if: always()]
```

### Release Pipeline (`release.yml`)

```
release:
  permissions: [contents:write, pull-requests:write, id-token:write, packages:write]
  steps:
    checkout → pnpm → node → install → build
    → changesets/action@v1 (publish/release, version/version-packages)
       env: GITHUB_TOKEN, NPM_TOKEN, NPM_CONFIG_PROVENANCE=true
    → Mirror to GitHub Packages:
       @reaatech:registry=https://npm.pkg.github.com
       strips @reaatech/confidence-router- prefix → packages/{dir}
```

## CI Job Matrix

| Job | Needs | Purpose |
|-----|-------|---------|
| `install` | — | Install deps, cache pnpm store |
| `audit` | — | Security vulnerability scan |
| `format` | install | Biome format check |
| `lint` | install | Biome lint check |
| `typecheck` | install | Cross-package type checking |
| `build` | lint, typecheck | Build all packages, upload artifacts |
| `test` | build | Matrix: Node 20 + 22, download build artifacts |
| `coverage` | build | Coverage report, upload + post summary |
| `all-checks` | all above | Gate checker for branch protection |

## Secrets Configuration

| Secret | Purpose | Set In |
|--------|---------|--------|
| `NPM_TOKEN` | Publish to npmjs.org | GitHub repo secrets |
| `GITHUB_TOKEN` | Publish to GitHub Packages (auto-provisioned) | Workflow `permissions:` |

## Package Manager & Engine Requirements

```json
// root package.json
{
  "engines": { "node": ">=22.0.0" },
  "packageManager": "pnpm@10.33.0"
}
```

## npm Publishing Checklist

Before first publish:
- [ ] `NPM_TOKEN` set in GitHub repo secrets
- [ ] GitHub Actions permissions: Read and write + allow PR creation
- [ ] `.changeset/config.json` has `access: public` + correct repo
- [ ] All packages have `publishConfig.access: "public"`
- [ ] Root `package.json` is `private: true`
- [ ] All examples are `private: true`
- [ ] Per-package `LICENSE` files exist
- [ ] Release workflow starts with `workflow_dispatch` only (first publish)

After first manual publish:
- [ ] Add `push: branches: [main]` trigger to release.yml
- [ ] Verify all packages return 200 from npm registry
- [ ] Verify GitHub Packages mirror

## Dependencies

- Project Setup Agent (for initial monorepo structure)
- Testing Agent (for CI test configuration)

---

**Agent Version**: 2.0.0
**Last Updated**: 2026-04-30
**Status**: Active
