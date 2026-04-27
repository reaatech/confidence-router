# Contributing to Confidence Router

Thank you for your interest in contributing to Confidence Router! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)
- [Pull Request Process](#pull-request-process)
- [Agent Skills Development](#agent-skills-development)
- [Community](#community)

## Code of Conduct

### Our Pledge

We as members, contributors, and leaders pledge to make participation in our community a harassment-free experience for everyone, regardless of age, body size, visible or invisible disability, ethnicity, sex characteristics, gender identity and expression, level of experience, education, socio-economic status, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

Examples of behavior that contributes to a positive environment:

- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

Examples of unacceptable behavior:

- The use of sexualized language or imagery and unwelcome sexual attention
- Trolling, insulting/derogatory comments, and personal or political attacks
- Public or private harassment
- Publishing others' private information without explicit permission
- Other conduct which could reasonably be considered inappropriate in a professional setting

### Enforcement

Instances of abusive, harassing, or otherwise unacceptable behavior may be reported by contacting the project team at [GitHub Issues](https://github.com/reaatech/confidence-router/issues). All complaints will be reviewed and investigated and will result in a response that is deemed necessary and appropriate to the circumstances.

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- pnpm (latest stable version)
- Git
- GitHub account

### Initial Setup

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/your-username/confidence-router.git
   cd confidence-router
   ```
3. Add the upstream remote:
   ```bash
   git remote add upstream https://github.com/reaatech/confidence-router.git
   ```
4. Install dependencies:
   ```bash
   pnpm install
   ```

## Development Setup

### Project Structure

```
confidence-router/
├── src/                    # Source code
│   ├── core/              # Decision engine
│   ├── classifiers/       # Pluggable classifiers
│   ├── languages/         # Multi-language support
│   ├── evaluation/        # Evaluation harness
│   ├── config/            # Configuration
│   └── types/             # TypeScript definitions
├── tests/                 # Test files
├── examples/              # Usage examples
└── skills/                # Agent skills
```

### Available Scripts

```bash
# Development
pnpm dev                    # Start development server
pnpm build                 # Build the project
pnpm typecheck            # Run TypeScript type checking

# Testing
pnpm test                 # Run tests
pnpm test:coverage      # Generate coverage report
pnpm test:ui            # Open Vitest UI

# Code Quality
pnpm lint                 # Run ESLint
pnpm lint:fix           # Fix linting issues
pnpm format              # Format code with Prettier
pnpm format:check       # Check code formatting
```

### Development Workflow

1. Create a new branch for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Make your changes and commit them:
   ```bash
   git add .
   git commit -m "feat: add your feature"
   ```
3. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
4. Create a Pull Request on GitHub

## How to Contribute

### Types of Contributions

We welcome various types of contributions:

- **Bug fixes**: Fix issues reported in GitHub Issues
- **New features**: Implement new functionality
- **Documentation**: Improve or add documentation
- **Tests**: Add or improve test coverage
- **Performance improvements**: Optimize existing code
- **Agent skills**: Create new agent skills for development automation
- **Translations**: Help with internationalization (45+ languages)
- **Examples**: Create usage examples and tutorials

### Reporting Bugs

Before creating bug reports, please check existing issues. When creating a bug report, include:

- Clear title and description
- Steps to reproduce the behavior
- Expected vs actual behavior
- Screenshots if applicable
- Environment details (Node.js version, OS, etc.)

**Example:**
```markdown
**Bug Report**

**Description:** Decision engine returns incorrect routing for confidence scores exactly at threshold

**Steps to Reproduce:**
1. Set routeThreshold to 0.8
2. Provide classification with confidence exactly 0.8
3. Observe incorrect FALLBACK decision

**Expected:** ROUTE decision
**Actual:** FALLBACK decision

**Environment:**
- Node.js: 20.10.0
- OS: macOS 14.1
- confidence-router: 1.0.0
```

### Suggesting Features

Feature suggestions are welcome! Please provide:

- Use case and motivation
- Proposed solution
- Examples of how it would be used
- Potential impact on existing functionality

## Coding Standards

### TypeScript

- Use strict mode (`"strict": true` in tsconfig.json)
- Define explicit types for all function parameters and return values
- Avoid `any` type; use specific types or `unknown`
- Use interfaces for object shapes
- Prefer `const` over `let` where possible

### Code Style

- Follow ESLint configuration (airbnb-base + TypeScript)
- Use Prettier for formatting (2 spaces, single quotes)
- Maximum line length: 100 characters
- Use meaningful variable names
- Keep functions small and focused

### Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `perf:` Performance improvement
- `test:` Test additions or changes
- `chore:` Build process or tooling changes

**Examples:**
```bash
feat: add multi-language clarification prompts
fix: resolve threshold comparison edge case
docs: update API documentation
test: add unit tests for decision engine
```

### Code Organization

- One class/interface per file (with exceptions for small related types)
- Group related functionality in directories
- Keep files under 300 lines when possible
- Use barrel exports (`index.ts`) for public API

## Testing

### Test Coverage Requirements

- **Overall coverage**: >95%
- **Critical paths**: 100% coverage
- **Public APIs**: Complete test coverage
- **Edge cases**: Documented and tested

### Writing Tests

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { DecisionEngine } from '../src/core/DecisionEngine';

describe('DecisionEngine', () => {
  let engine: DecisionEngine;

  beforeEach(() => {
    engine = new DecisionEngine({
      routeThreshold: 0.8,
      fallbackThreshold: 0.3
    });
  });

  it('should route when confidence exceeds threshold', async () => {
    const classification = {
      predictions: [{ label: 'intent_a', confidence: 0.9 }]
    };

    const decision = await engine.decide(classification);

    expect(decision.type).toBe('ROUTE');
    expect(decision.target).toBe('intent_a');
  });
});
```

### Running Tests

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test tests/unit/DecisionEngine.test.ts

# Run with coverage
pnpm test:coverage

# Run in watch mode
pnpm test:watch
```

## Documentation

### Documentation Standards

- All public APIs must be documented with JSDoc
- Include usage examples for complex functionality
- Update README for user-facing changes
- Add inline comments for complex logic

### JSDoc Format

```typescript
/**
 * Makes a routing decision based on classification confidence scores.
 * 
 * @param classification - The classification result with confidence scores
 * @returns A routing decision (ROUTE, CLARIFY, or FALLBACK)
 * @throws {RouterError} If classification is invalid or processing fails
 * 
 * @example
 * ```typescript
 * const decision = await router.decide({
 *   predictions: [
 *     { label: 'support', confidence: 0.85 },
 *     { label: 'sales', confidence: 0.15 }
 *   ]
 * });
 * 
 * console.log(decision.type); // 'ROUTE'
 * console.log(decision.target); // 'support'
 * ```
 */
async decide(classification: ClassificationResult): Promise<RoutingDecision>
```

### README Updates

Update README.md when:
- Adding new features
- Changing existing APIs
- Adding configuration options
- Adding examples
- Changing installation requirements

## Pull Request Process

### Before Submitting

1. **Update documentation** if needed
2. **Add tests** for new functionality
3. **Ensure all tests pass**: `pnpm test`
4. **Check code formatting**: `pnpm format:check`
5. **Run linting**: `pnpm lint`
6. **Update CHANGELOG.md** if applicable

### PR Title Format

Use conventional commit format:
- `feat: add new classifier type`
- `fix: resolve memory leak in decision engine`
- `docs: update configuration guide`

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests added/updated
- [ ] All tests pass
- [ ] Coverage maintained/improved

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Tests added for edge cases
```

### Review Process

1. **Automated checks** must pass (tests, linting, formatting)
2. **Code review** by maintainers
3. **Address feedback** and update PR
4. **Approval** from at least one maintainer
5. **Merge** by maintainer

### After Merge

- Delete feature branch
- Monitor for any issues
- Update project board if applicable

## Agent Skills Development

### Creating New Agent Skills

Agent skills automate development tasks. To create a new skill:

1. Create directory: `skills/<skill-name>/`
2. Create `skills.md` with:
   - Purpose
   - Capabilities
   - Triggers
   - Dependencies
   - Configuration
   - Examples

### Agent Skill Template

```markdown
# Agent Name

## Purpose
Brief description of agent's purpose

## Capabilities
- Capability 1
- Capability 2
- Capability 3

## Triggers
When this agent should be activated

## Dependencies
Other agents or systems this agent depends on

## Configuration
Configuration options for this agent

## Examples
Usage examples and scenarios
```

### Agent Skill Examples

- **Project Setup Agent**: Initializes project structure
- **Core Engine Agent**: Implements decision logic
- **Multi-Language Agent**: Manages translations
- **Classifier Agent**: Implements classifiers
- **Evaluation Agent**: Handles threshold optimization
- **Documentation Agent**: Generates documentation
- **Testing Agent**: Implements test suites
- **DevOps Agent**: Manages deployment

## Community

### Communication

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: Questions and community discussions
- **Discord**: Real-time chat (link in README)

### Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Annual contributor highlights

### Becoming a Maintainer

Active contributors may be invited to become maintainers:
- Consistent contributions over time
- Deep understanding of the codebase
- Good communication skills
- Commitment to project vision

## Legal

### License

By contributing, you agree that your contributions will be licensed under the MIT License.

### Copyright

Copyright (c) 2026 reaaatech. All rights reserved.

---

Thank you for contributing to Confidence Router! 🚀

**Last Updated**: 2026-04-22  
**Version**: 1.0.0
