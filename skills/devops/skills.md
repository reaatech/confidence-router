# DevOps Agent

## Purpose
Handle CI/CD pipeline configuration, basic deployment automation, and development environment setup for the confidence-router npm library.

## Capabilities

### CI/CD Pipeline Management
- Configure GitHub Actions workflows
- Set up automated testing pipelines
- Create build and release automation
- Implement quality gates

### Basic Containerization
- Create Dockerfile for example/demo server
- Configure docker-compose for local development

### Environment Management
- Configure development environments
- Manage environment validation

## Triggers
- Deployment preparation
- CI/CD pipeline configuration
- Release automation

## Dependencies
- Project Setup Agent (for CI/CD foundation)
- Testing Agent (for quality gates)

## Configuration

### CI/CD Configuration
```typescript
interface CICDConfig {
  platform: 'github-actions';
  branches: {
    main: DeploymentConfig;
    develop: DeploymentConfig;
    feature: DeploymentConfig;
  };
  qualityGates: QualityGateConfig[];
}
```

### Deployment Configuration
```typescript
interface DeploymentConfig {
  autoDeploy: boolean;
  healthChecks: HealthCheckConfig[];
}
```

## Examples

### GitHub Actions Workflow
```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Lint
        run: pnpm lint
      
      - name: Type check
        run: pnpm typecheck
      
      - name: Test
        run: pnpm test -- --coverage
      
      - name: Build
        run: pnpm build
```

### Dockerfile (for examples/demo)
```dockerfile
# Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

FROM node:20-alpine AS runtime

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --production --frozen-lockfile

COPY --from=builder /app/dist ./dist

USER node
EXPOSE 3000

CMD ["node", "dist/index.js"]
```

## Output Artifacts

### CI/CD Scripts
- `.github/workflows/ci.yml` — test, lint, typecheck, build
- `.github/workflows/release.yml` — automated npm publishing on tag

### Deployment Scripts
```bash
#!/bin/bash
# scripts/publish.sh

set -e

VERSION=$(node -p "require('./package.json').version")
echo "Publishing version $VERSION"

pnpm build
pnpm publish --access public
```

## Quality Standards

### Deployment Quality
- Automated testing on every PR
- Type checking before merge
- Linting and formatting enforcement
- Build verification

### Infrastructure Quality
- Simple, reproducible builds
- Minimal container images
- Clear environment separation

## Error Handling

### DevOps Errors
```typescript
enum DevOpsError {
  DEPLOYMENT_FAILED = 'DEPLOYMENT_FAILED',
  BUILD_FAILED = 'BUILD_FAILED',
  PUBLISH_FAILED = 'PUBLISH_FAILED'
}
```

### Recovery Strategies
- Automated retry for flaky tests
- Build artifact preservation
- Rollback to previous npm version on failure

## Security Considerations

### Security Measures
- Secret management via GitHub Secrets
- Dependency scanning (Dependabot)
- Code scanning

## Integration Points

### With Other Agents
- **Testing Agent**: Integrate quality gates
- **Documentation Agent**: Document release process
- **Core Engine Agent**: Monitor build performance

### External Services
- GitHub Actions
- npm registry
- Docker Hub (optional)

## Maintenance

### Regular Updates
- Monthly dependency updates
- Quarterly CI action version updates

### Monitoring
- Build times
- Test execution times
- Dependency health

## Support

### Operational Resources
- Release runbook
- CI/CD troubleshooting guide

---

**Agent Version**: 1.0.0  
**Last Updated**: 2026-04-22  
**Status**: Active
