# Agent Skills for Confidence Router

This document outlines the AI agent skills and capabilities for developing the `@reaatech/confidence-router` monorepo. These skills are designed to assist with various aspects of project development, from initial setup to deployment.

## Monorepo Structure

confidence-router is a **pnpm-based TypeScript monorepo** with 5 publishable packages and 5 example workspaces:

```
confidence-router/
├── packages/                    # Publishable library packages
│   ├── core/                    @reaatech/confidence-router-core
│   ├── classifiers/             @reaatech/confidence-router-classifiers
│   ├── languages/               @reaatech/confidence-router-languages
│   ├── evaluation/              @reaatech/confidence-router-evaluation
│   └── confidence-router/       @reaatech/confidence-router
├── examples/                    # Private example workspaces
│   ├── basic-routing/
│   ├── built-in-classifiers/
│   ├── custom-classifier/
│   ├── evaluation/
│   └── multi-language/
├── skills/                      # Agent skill definitions
├── .changeset/                  # Changesets versioning config
├── .github/workflows/           # CI/CD (ci.yml + release.yml)
├── pnpm-workspace.yaml
├── turbo.json
├── biome.json
├── tsconfig.json
└── tsconfig.typecheck.json
```

## Toolchain

| Concern | Tool |
|----------|------|
| Package manager | pnpm 10 (workspaces) |
| Build | tsup (per package) + turbo (orchestration) |
| Lint + Format | Biome |
| Testing | Vitest 3 |
| TypeScript | 5.8.3 (strict, NodeNext) |
| Versioning | Changesets |
| CI/CD | GitHub Actions |
| Node target | 22 LTS |

## Available Agent Skills

### 1. Project Setup Agent (`skills/project-setup/skills.md`)
**Purpose**: Initialize and configure the monorepo structure

**Capabilities**:
- Initialize pnpm workspace with TypeScript 5.8
- Configure Biome for lint + format
- Set up Vitest per package
- Configure turbo for build orchestration
- Set up Changesets for versioning
- Create package scaffolding under `packages/*`

**Triggers**: Project initialization, environment setup

### 2. Core Engine Agent (`skills/core-engine/skills.md`)
**Purpose**: Implement the decision engine and routing logic in `@reaatech/confidence-router-core`

**Capabilities**:
- Design and implement decision tree logic
- Create threshold comparison engine
- Implement routing decision algorithms
- Build configuration validation system
- Create type definitions and DI interfaces

**Triggers**: Core functionality development, algorithm implementation

### 3. Multi-Language Agent (`skills/multi-language/skills.md`)
**Purpose**: Implement internationalization and clarification prompt generation in `@reaatech/confidence-router-languages`

**Capabilities**:
- Implement ISO 639-1 language code support
- Create language configuration system
- Generate localized clarification prompts
- Manage translation files for 47 languages
- Implement cultural adaptation for prompts

**Triggers**: Internationalization requirements, prompt generation

### 4. Classifier Agent (`skills/classifiers/skills.md`)
**Purpose**: Implement pluggable classifier system in `@reaatech/confidence-router-classifiers`

**Capabilities**:
- Design classifier interface architecture
- Implement LLM-based classifiers (OpenAI, Anthropic)
- Create embedding similarity classifiers
- Build keyword-based classifiers
- Implement classifier registry and fallback chains

**Triggers**: Classifier integration, AI model implementation

### 5. Evaluation Agent (`skills/evaluation/skills.md`)
**Purpose**: Build evaluation harness and threshold optimization in `@reaatech/confidence-router-evaluation`

**Capabilities**:
- Create dataset loading and validation
- Implement performance metrics calculation
- Build threshold optimization algorithms (grid search)
- Generate evaluation reports

**Triggers**: Performance tuning, threshold optimization

### 6. Documentation Agent (`skills/documentation/skills.md`)
**Purpose**: Generate and maintain project documentation

**Capabilities**:
- Write API documentation per package
- Create usage examples and tutorials
- Generate decision tree visualizations
- Maintain per-package READMEs and root README
- Create inline code documentation

**Triggers**: Documentation updates, example creation

### 7. Testing Agent (`skills/testing/skills.md`)
**Purpose**: Implement comprehensive testing strategy

**Capabilities**:
- Write unit tests per package
- Create integration tests across packages
- Build performance benchmarks
- Generate test reports
- Configure per-package vitest configs

**Triggers**: Test development, quality assurance

### 8. DevOps Agent (`skills/devops/skills.md`)
**Purpose**: Handle deployment and CI/CD infrastructure

**Capabilities**:
- Configure CI/CD pipelines (ci.yml + release.yml)
- Set up Changesets release automation
- Configure npm + GitHub Packages publishing
- Manage environment configurations
- Set up Dependabot for dependency updates

**Triggers**: Deployment preparation, CI/CD setup

## Agent Collaboration Workflow

```
┌─────────────────┐
│  Project Setup  │
│     Agent       │
└────────┬────────┘
         │
    ┌────┴────────────────────────────────────┐
    │                                         │
┌───▼──────────┐                        ┌────▼──────────┐
│ Core Engine  │                        │  Classifier   │
│    Agent     │                        │    Agent      │
│ (packages/   │                        │ (packages/    │
│  core/)      │                        │  classifiers/)│
└───┬──────────┘                        └────┬──────────┘
    │                                         │
    │    ┌────────────────────────────────┐  │
    │    │                                │  │
    └───▶│     Multi-Language Agent       │◀─┘
         │     (packages/languages/)      │
         └────────────┬───────────────────┘
                      │
         ┌────────────▼───────────────────┐
         │                                │
    ┌────▼──────────┐                ┌────▼──────────┐
    │  Evaluation   │                │   Testing     │
    │    Agent      │                │    Agent      │
    │ (packages/    │                │  (per-package │
    │  evaluation/) │                │   tests/)     │
    └────┬──────────┘                └────┬──────────┘
         │                                │
         └────────────┬───────────────────┘
                      │
         ┌────────────▼───────────────────┐
         │    Documentation Agent         │
         └────────────┬───────────────────┘
                      │
         ┌────────────▼───────────────────┐
         │      DevOps Agent              │
         └────────────────────────────────┘
```

## Agent Communication Protocol

### Message Format
```typescript
interface AgentMessage {
  type: 'request' | 'response' | 'status' | 'error';
  from: string;
  to: string;
  payload: unknown;
  timestamp: number;
}
```

### Status Updates
- **idle**: Agent is available for tasks
- **busy**: Agent is currently processing
- **error**: Agent encountered an error
- **complete**: Agent has finished a task

## Agent Skill Execution

### Execution Modes

1. **Sequential**: Agents execute in a defined order
2. **Parallel**: Independent agents run simultaneously
3. **Conditional**: Agents execute based on conditions
4. **Event-driven**: Agents respond to specific events

### Error Handling

Each agent implements robust error handling:
- Graceful degradation
- Fallback mechanisms
- Error reporting and logging
- Recovery strategies

## Agent Configuration

### Environment Variables
```bash
# Agent Configuration
AGENT_MODE=development  # development, staging, production
AGENT_LOG_LEVEL=info    # debug, info, warn, error
AGENT_TIMEOUT=30000     # Timeout in milliseconds
AGENT_RETRY_ATTEMPTS=3  # Number of retry attempts
```

### Agent-Specific Configs
```json
{
  "agents": {
    "project-setup": {
      "enabled": true,
      "priority": 1,
      "dependencies": []
    },
    "core-engine": {
      "enabled": true,
      "priority": 2,
      "dependencies": ["project-setup"]
    },
    "classifiers": {
      "enabled": true,
      "priority": 2,
      "dependencies": ["core-engine"]
    },
    "multi-language": {
      "enabled": true,
      "priority": 2,
      "dependencies": ["core-engine"]
    },
    "evaluation": {
      "enabled": true,
      "priority": 3,
      "dependencies": ["core-engine", "classifiers"]
    },
    "testing": {
      "enabled": true,
      "priority": 3,
      "dependencies": ["core-engine"]
    },
    "documentation": {
      "enabled": true,
      "priority": 4,
      "dependencies": ["core-engine"]
    },
    "devops": {
      "enabled": true,
      "priority": 4,
      "dependencies": ["project-setup", "testing"]
    }
  }
}
```

## Agent Performance Metrics

### Key Metrics
- **Execution Time**: Time taken to complete tasks
- **Success Rate**: Percentage of successful executions
- **Error Rate**: Frequency of errors
- **Resource Usage**: CPU and memory consumption
- **Response Time**: Time to respond to requests

### Monitoring Dashboard
Real-time monitoring of agent performance and system health.

## Best Practices

### Agent Development
1. **Modularity**: Keep agents focused and single-purpose
2. **Reusability**: Design agents for multiple use cases
3. **Testability**: Ensure agents can be easily tested
4. **Maintainability**: Write clean, documented code
5. **Scalability**: Design for growth and increased load

### Agent Operations
1. **Monitoring**: Continuously monitor agent performance
2. **Logging**: Maintain comprehensive logs
3. **Alerting**: Set up alerts for critical issues
4. **Backup**: Implement backup and recovery procedures
5. **Security**: Follow security best practices

### Monorepo Conventions
1. **Single build tool**: tsup per package, turbo for orchestration
2. **Single linter**: Biome for both lint and format (no ESLint, no Prettier)
3. **Scoped packages**: All under `@reaatech/confidence-router-*`
4. **Dual ESM/CJS**: Every package ships both `index.js` and `index.cjs`
5. **Workspace deps**: Use `workspace:*` protocol for internal dependencies
6. **Versioning**: Changesets with `access: public` + GitHub Packages mirror

## Future Enhancements

### Planned Agent Skills
- **Security Agent**: Automated security scanning and fixes
- **Performance Agent**: Performance optimization and tuning
- **Analytics Agent**: Usage analytics and insights
- **Compliance Agent**: Regulatory compliance checking
- **Cost Optimization Agent**: Resource cost optimization

### Advanced Features
- **Machine Learning**: Self-improving agents
- **Natural Language**: Better human-agent interaction
- **Predictive Analysis**: Anticipatory problem solving
- **Autonomous Operation**: Reduced human intervention

## Contributing to Agent Skills

### Adding New Agents
1. Create skill directory: `skills/<agent-name>/`
2. Implement `skills.md` with capabilities
3. Add agent configuration
4. Write comprehensive tests
5. Document integration points

### Agent Skill Template
```markdown
# Agent Name

## Purpose
Brief description of agent's purpose

## Capabilities
- Capability 1
- Capability 2

## Triggers
When this agent should be activated

## Dependencies
Other agents or systems this agent depends on

## Configuration
Configuration options for this agent

## Examples
Usage examples and scenarios
```

## Support and Maintenance

### Getting Help
- **Documentation**: Comprehensive skill documentation
- **Examples**: Working examples for each agent
- **Troubleshooting**: Common issues and solutions
- **Community**: GitHub Discussions and Issues

### Maintenance Schedule
- **Daily**: Health checks and monitoring
- **Weekly**: Performance reviews and optimization
- **Monthly**: Security updates and patches
- **Quarterly**: Major updates and feature releases

## Repository Information

- **GitHub Organization**: reaaatech
- **Repository**: confidence-router
- **Agent Skills Directory**: `skills/`
- **Configuration**: `.agentrc.json`
- **Monorepo Tooling**: pnpm workspaces, turbo, Biome, Changesets

---

**Last Updated**: 2026-04-30
**Version**: 2.0.0
**Status**: Active Development
