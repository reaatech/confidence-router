# Project Setup Agent

## Purpose
Initialize and configure the confidence-router project structure with all necessary tooling and configurations for enterprise-grade TypeScript development.

## Capabilities

### Project Initialization
- Initialize pnpm project with TypeScript 5.x
- Configure package.json with appropriate scripts and dependencies
- Set up tsconfig.json with strict TypeScript settings
- Create .gitignore for Node.js/TypeScript projects

### Code Quality Tools
- Configure ESLint with TypeScript support
- Set up Prettier for code formatting
- Configure commitlint for commit message standards
- Set up husky for Git hooks

### Testing Framework
- Install and configure Vitest
- Set up test directory structure
- Configure test coverage reporting
- Create example test files

### Build Configuration
- Configure tsup or tsc for building
- Set up development server with ts-node
- Configure source maps for debugging
- Set up bundle analysis tools

### CI/CD Pipeline
- Create GitHub Actions workflows
- Configure automated testing
- Set up linting and formatting checks
- Configure build and deployment pipelines

### Directory Structure
```
confidence-router/
├── src/
│   ├── core/
│   ├── classifiers/
│   ├── languages/
│   ├── evaluation/
│   ├── config/
│   ├── types/
│   └── utils/
├── tests/
├── examples/
├── docs/
├── .github/
│   └── workflows/
└── [config files]
```

## Triggers
- Initial project creation
- Environment setup for new developers
- CI/CD pipeline configuration
- Project structure reorganization

## Dependencies
- None (this is typically the first agent to run)

## Configuration

### Environment Variables
```bash
# Project Setup Configuration
PROJECT_NAME=confidence-router
PROJECT_VERSION=1.0.0
PROJECT_DESCRIPTION="Decision engine for route/clarify/fallback patterns"
PROJECT_AUTHOR="reaatech"
PROJECT_LICENSE=MIT
```

### Setup Options
```json
{
  "typescript": {
    "strict": true,
    "target": "ES2022",
    "module": "NodeNext"
  },
  "testing": {
    "framework": "vitest",
    "coverage": true,
    "coverageThreshold": 95
  },
  "ci": {
    "platform": "github-actions",
    "nodeVersion": "20.x",
    "testOnPush": true,
    "testOnPR": true
  }
}
```

## Examples

### Basic Project Setup
```bash
# Initialize project
pnpm init
pnpm add -D typescript @types/node
pnpm add -D vitest @vitest/ui
pnpm add -D eslint @typescript-eslint/eslint-plugin
pnpm add -D prettier
pnpm add -D husky lint-staged commitlint
```

### Configuration Files Generated
- `package.json` - Project metadata and scripts
- `tsconfig.json` - TypeScript configuration
- `vitest.config.ts` - Test configuration
- `.eslintrc.js` - Linting rules
- `.prettierrc` - Code formatting rules
- `.commitlintrc.js` - Commit message rules
- `.husky/pre-commit` - Pre-commit hooks
- `.github/workflows/ci.yml` - CI/CD pipeline

## Output Artifacts

### Package.json Scripts
```json
{
  "scripts": {
    "build": "tsup",
    "dev": "ts-node --esm src/index.ts",
    "test": "vitest",
    "test:coverage": "vitest --coverage",
    "test:ui": "vitest --ui",
    "lint": "eslint src --ext .ts",
    "lint:fix": "eslint src --ext .ts --fix",
    "format": "prettier --write src/",
    "format:check": "prettier --check src/",
    "typecheck": "tsc --noEmit",
    "prepare": "husky install"
  }
}
```

### GitHub Actions Workflow
```yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm typecheck
      - run: pnpm test
      - run: pnpm test:coverage
      - run: pnpm build
```

## Quality Standards

### TypeScript Configuration
- Strict mode enabled
- No implicit any
- Strict null checks
- Module resolution: NodeNext

### Code Quality
- ESLint with TypeScript support
- Prettier for consistent formatting
- Pre-commit hooks for quality gates
- Automated linting in CI

### Testing Standards
- Minimum 95% code coverage
- Unit tests for all functions
- Integration tests for workflows
- Performance benchmarks

## Error Handling

### Common Issues
1. **Dependency Conflicts**: Use pnpm's strict dependency resolution
2. **TypeScript Errors**: Strict configuration with clear error messages
3. **CI/CD Failures**: Detailed error reporting and debugging guides
4. **Environment Issues**: Containerized development environment

### Recovery Strategies
- Automated rollback for failed setups
- Configuration validation before application
- Backup of previous configurations
- Detailed setup logs for troubleshooting

## Performance Considerations

### Build Optimization
- Tree shaking for smaller bundles
- Code splitting for faster loading
- Caching for faster rebuilds
- Parallel processing for builds

### Development Experience
- Hot module replacement
- Fast TypeScript compilation
- Efficient test running
- Quick linting and formatting

## Security Considerations

### Dependency Security
- Regular dependency audits
- Lock file integrity checks
- Known vulnerability scanning
- Secure dependency sources

### Code Security
- Input validation
- Secure defaults
- Principle of least privilege
- Security-focused linting rules

## Integration Points

### With Other Agents
- **Core Engine Agent**: Provides project structure for core implementation
- **Testing Agent**: Sets up testing framework and infrastructure
- **DevOps Agent**: Configures deployment and monitoring
- **Documentation Agent**: Creates documentation structure

### External Tools
- **GitHub**: Repository and CI/CD integration
- **npm/pnpm**: Package management
- **VS Code**: Editor configuration
- **Docker**: Containerization support

## Maintenance

### Regular Updates
- Monthly dependency updates
- Quarterly tool version updates
- Annual major version upgrades
- Security patches as needed

### Monitoring
- Build times
- Test execution times
- Dependency health
- Security vulnerabilities

## Support

### Documentation
- Setup guides
- Configuration references
- Troubleshooting guides
- Best practices

### Community
- GitHub Issues for bug reports
- GitHub Discussions for questions
- Contributing guidelines
- Code of conduct

---

**Agent Version**: 1.0.0  
**Last Updated**: 2026-04-22  
**Status**: Active
