# Documentation Agent

## Purpose
Create and maintain comprehensive documentation for the confidence-router project including API documentation, usage examples, tutorials, decision tree visualizations, and developer guides.

## Capabilities

### API Documentation
- Generate Typedoc documentation
- Create comprehensive API references
- Write usage examples for all functions
- Document configuration options
- Create migration guides

### Tutorial Creation
- Write getting started guides
- Create step-by-step tutorials
- Develop advanced usage guides
- Build integration examples
- Create video tutorial scripts

### Visualization Generation
- Generate decision tree diagrams
- Create architecture diagrams
- Build flow charts for processes
- Generate sequence diagrams
- Create interactive documentation

### Guide Development
- Write installation guides
- Create configuration guides
- Develop troubleshooting guides
- Write best practices guides
- Create contribution guidelines

### Example Generation
- Create basic usage examples
- Develop advanced examples
- Build integration examples
- Create performance examples
- Generate testing examples

## Triggers
- Documentation updates
- New feature documentation
- Example creation
- Tutorial development

## Dependencies
- Core Engine Agent (for feature understanding)
- Testing Agent (for example validation)
- All other agents (for comprehensive coverage)

## Configuration

### Documentation Configuration
```typescript
interface DocumentationConfig {
  outputDir: string;
  format: 'markdown' | 'html' | 'both';
  typedoc: {
    enabled: boolean;
    theme: string;
    excludePrivate: boolean;
  };
  examples: {
    enabled: boolean;
    outputDir: string;
  };
  diagrams: {
    enabled: boolean;
    format: 'mermaid' | 'plantuml' | 'svg';
  };
}
```

### Content Configuration
```typescript
interface ContentConfig {
  readme: {
    includeBadges: boolean;
    includeTOC: boolean;
    includeExamples: boolean;
  };
  api: {
    includeExamples: boolean;
    includeTypes: boolean;
    includeDeprecated: boolean;
  };
  tutorials: {
    levels: ('beginner' | 'intermediate' | 'advanced')[];
    formats: ('text' | 'video' | 'interactive')[];
  };
}
```

## Examples

### API Documentation Generator
```typescript
// src/documentation/APIDocumentationGenerator.ts
export class APIDocumentationGenerator {
  constructor(private config: DocumentationConfig) {}
  
  async generate(sourceDir: string): Promise<void> {
    // Generate Typedoc
    if (this.config.typedoc.enabled) {
      await this.generateTypedoc(sourceDir);
    }
    
    // Generate examples documentation
    if (this.config.examples.enabled) {
      await this.generateExamplesDocs();
    }
    
    // Generate diagrams
    if (this.config.diagrams.enabled) {
      await this.generateDiagrams();
    }
  }
  
  private async generateTypedoc(sourceDir: string): Promise<void> {
    const app = await TypeDoc.Application.bootstrap({
      entryPoints: [`${sourceDir}/index.ts`],
      theme: this.config.typedoc.theme,
      excludePrivate: this.config.typedoc.excludePrivate,
      out: `${this.config.outputDir}/api`
    });
    
    await app.generateDocs();
  }
}
```

### Decision Tree Visualizer
```typescript
// src/documentation/DecisionTreeVisualizer.ts
export class DecisionTreeVisualizer {
  generateMermaidDiagram(config: RouterConfig): string {
    return `
graph TD
    A[Classification Result] --> B{Evaluate Top Score}
    B -->|score >= ${config.routeThreshold}| C[ROUTE: Top Match]
    B -->|${config.fallbackThreshold} <= score < ${config.routeThreshold}| D{Check Clarification}
    B -->|score < ${config.fallbackThreshold}| E[FALLBACK: Default]
    
    D -->|clarification enabled| F[CLARIFY: Generate Prompt]
    D -->|clarification disabled| E
    
    F --> G[Multi-language Prompt]
    G --> H[Return Clarification Options]
    
    C --> I[Return Route Decision]
    E --> J[Return Fallback Decision]
    H --> K[Return Clarify Decision]
    `;
  }
  
  generateSVGDiagram(config: RouterConfig): string {
    // Generate SVG version for static documentation
    return this.renderAsSVG(this.generateMermaidDiagram(config));
  }
}
```

### Tutorial Generator
```typescript
// src/documentation/TutorialGenerator.ts
export class TutorialGenerator {
  generateTutorial(level: string, topic: string): Tutorial {
    const template = this.getTemplate(level, topic);
    const examples = this.getExamples(level, topic);
    const exercises = this.getExercises(level, topic);
    
    return {
      title: this.generateTitle(level, topic),
      description: this.generateDescription(level, topic),
      prerequisites: this.getPrerequisites(level, topic),
      steps: this.generateSteps(template, examples),
      exercises,
      additionalResources: this.getResources(level, topic)
    };
  }
  
  private generateSteps(template: string, examples: any[]): TutorialStep[] {
    return examples.map((example, index) => ({
      number: index + 1,
      title: example.title,
      description: example.description,
      code: example.code,
      explanation: example.explanation
    }));
  }
}
```

### README Generator
```typescript
// src/documentation/READMEGenerator.ts
export class READMEGenerator {
  generate(projectInfo: ProjectInfo): string {
    return `
# ${projectInfo.name}

${this.generateBadges(projectInfo)}

${projectInfo.description}

## Table of Contents
${this.generateTOC(projectInfo)}

## Installation
${this.generateInstallation(projectInfo)}

## Quick Start
${this.generateQuickStart(projectInfo)}

## Features
${this.generateFeatures(projectInfo)}

## Usage
${this.generateUsage(projectInfo)}

## Examples
${this.generateExamples(projectInfo)}

## Documentation
${this.generateDocumentationLinks(projectInfo)}

## Contributing
${this.generateContributing(projectInfo)}

## License
${this.generateLicense(projectInfo)}
    `;
  }
  
  private generateBadges(projectInfo: ProjectInfo): string {
    return `
[![npm version](https://badge.fury.io/js/${projectInfo.name}.svg)](https://badge.fury.io/js/${projectInfo.name})
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Tests](https://github.com/reaatech/${projectInfo.name}/workflows/Tests/badge.svg)](https://github.com/reaatech/${projectInfo.name}/actions)
    `;
  }
}
```

## Output Artifacts

### Generated Documentation Structure
```
docs/
├── api/                    # Typedoc generated API docs
├── guides/
│   ├── getting-started.md
│   ├── configuration.md
│   ├── tutorials/
│   │   ├── basic-routing.md
│   │   ├── multi-language.md
│   │   ├── custom-classifiers.md
│   │   └── evaluation.md
│   └── advanced/
│       ├── performance.md
│       ├── security.md
│       └── deployment.md
├── examples/
│   ├── basic/
│   ├── intermediate/
│   └── advanced/
└── diagrams/
    ├── architecture.svg
    ├── decision-tree.svg
    └── sequence-diagrams/
```

### Example Documentation
```typescript
// examples/basic/basic-routing.ts
/**
 * Basic Routing Example
 * 
 * This example demonstrates the simplest use case of confidence-router:
 * routing a classification result based on confidence thresholds.
 */

import { ConfidenceRouter } from 'confidence-router';

// Create router with default configuration
const router = new ConfidenceRouter({
  thresholds: {
    routeThreshold: 0.8,
    fallbackThreshold: 0.3,
    clarificationEnabled: true
  }
});

// Classification result from your classifier
const classification = {
  predictions: [
    { label: 'support_question', confidence: 0.85 },
    { label: 'sales_inquiry', confidence: 0.12 },
    { label: 'feedback', confidence: 0.03 }
  ]
};

// Make routing decision
const decision = await router.decide(classification);

console.log(decision);
// Output: {
//   type: 'ROUTE',
//   target: 'support_question',
//   confidence: 0.85
// }
```

### Tutorial Example
```markdown
# Getting Started with Confidence Router

## Prerequisites
- Node.js 20.x or higher
- pnpm package manager
- Basic TypeScript knowledge

## Installation

```bash
pnpm add confidence-router
```

## Basic Usage

### 1. Import and Initialize

```typescript
import { ConfidenceRouter } from 'confidence-router';

const router = new ConfidenceRouter({
  thresholds: {
    routeThreshold: 0.8,
    fallbackThreshold: 0.3
  }
});
```

### 2. Create Classification Result

```typescript
const classification = {
  predictions: [
    { label: 'intent_a', confidence: 0.85 },
    { label: 'intent_b', confidence: 0.12 }
  ]
};
```

### 3. Get Routing Decision

```typescript
const decision = await router.decide(classification);

if (decision.type === 'ROUTE') {
  console.log(`Routing to: ${decision.target}`);
} else if (decision.type === 'CLARIFY') {
  console.log(`Clarification needed: ${decision.prompt}`);
} else {
  console.log('Using fallback handler');
}
```

## Next Steps
- [Multi-Language Support](./multi-language.md)
- [Custom Classifiers](./custom-classifiers.md)
- [Evaluation and Tuning](./evaluation.md)
```

## Quality Standards

### Documentation Quality
- Clear and concise writing
- Comprehensive coverage
- Up-to-date information
- Multiple learning formats
- Accessible language

### Code Quality
- Working code examples
- Tested documentation
- Consistent formatting
- Proper syntax highlighting
- Error-free content

### Performance
- Fast documentation generation
- Optimized for reading
- Search-friendly structure
- Mobile-responsive design

## Error Handling

### Documentation Errors
```typescript
enum DocumentationError {
  SOURCE_NOT_FOUND = 'SOURCE_NOT_FOUND',
  GENERATION_FAILED = 'GENERATION_FAILED',
  INVALID_TEMPLATE = 'INVALID_TEMPLATE',
  EXAMPLE_EXECUTION_FAILED = 'EXAMPLE_EXECUTION_FAILED'
}
```

### Recovery Strategies
- Fallback to basic documentation
- Manual documentation options
- Error reporting and logging
- Community contribution options

## Documentation Types

### API Documentation
- Function signatures
- Type definitions
- Parameter descriptions
- Return value documentation
- Usage examples

### Conceptual Documentation
- Architecture overviews
- Design patterns
- Best practices
- Common patterns
- Anti-patterns

### Task-Based Documentation
- Step-by-step guides
- How-to articles
- Tutorials
- Walkthroughs
- Quick starts

### Reference Documentation
- Configuration reference
- API reference
- CLI reference
- Error reference
- FAQ

## Integration Points

### With Other Agents
- **All Agents**: Document their implementations
- **Testing Agent**: Validate documentation examples
- **Core Engine Agent**: Document core features
- **DevOps Agent**: Document deployment

### External Tools
- Typedoc for API docs
- Mermaid for diagrams
- Markdown parsers
- Static site generators
- Documentation hosting

## Maintenance

### Documentation Updates
- Regular content reviews
- Version-specific documentation
- Breaking change documentation
- Deprecation notices
- Migration guides

### Quality Assurance
- Link checking
- Example validation
- Spell checking
- Grammar checking
- Accessibility testing

## Support

### Documentation Resources
- Comprehensive guides
- Video tutorials
- Interactive examples
- Community examples
- FAQ sections

### Community
- Documentation contributions
- Translation programs
- Review processes
- Feedback collection
- Improvement suggestions

---

**Agent Version**: 1.0.0  
**Last Updated**: 2026-04-22  
**Status**: Active
