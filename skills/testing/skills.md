# Testing Agent

## Purpose
Implement comprehensive testing strategy with unit tests, integration tests, end-to-end tests, and performance benchmarks to ensure high quality and reliability of the confidence-router system.

## Capabilities

### Test Framework Setup
- Configure Vitest testing framework
- Set up test directory structure
- Configure test coverage reporting
- Create test utilities and helpers
- Implement test data generators

### Unit Testing
- Write unit tests for all functions
- Achieve >95% code coverage
- Create mock objects and stubs
- Implement test fixtures
- Write edge case tests

### Integration Testing
- Create integration test suites
- Test component interactions
- Implement API integration tests
- Create database integration tests
- Write third-party service tests

### End-to-End Testing
- Build E2E test workflows
- Create user scenario tests
- Implement workflow validation
- Create regression tests
- Build smoke tests

### Performance Testing
- Create performance benchmarks
- Implement load testing
- Write stress tests
- Create scalability tests
- Build performance monitoring

### Test Data Management
- Generate test datasets
- Create test data factories
- Implement data seeding
- Create test data cleanup
- Manage test data versions

## Triggers
- Test development requirements
- Quality assurance needs
- Performance validation
- Regression testing

## Dependencies
- Project Setup Agent (for test framework)
- Core Engine Agent (for feature testing)
- All other agents (for comprehensive coverage)

## Configuration

### Testing Configuration
```typescript
interface TestingConfig {
  framework: 'vitest' | 'jest';
  coverage: {
    enabled: boolean;
    threshold: number;
    include: string[];
    exclude: string[];
  };
  parallel: boolean;
  watch: boolean;
  reporters: ('default' | 'json' | 'html')[];
}
```

### Test Environment Configuration
```typescript
interface TestEnvironmentConfig {
  nodeEnvironment: string;
  globals: boolean;
  setupFiles: string[];
  teardownFiles: string[];
  testTimeout: number;
  mockModules: string[];
}
```

## Examples

### Unit Test Example
```typescript
// tests/unit/DecisionEngine.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { DecisionEngine } from '../../src/core/DecisionEngine';
import { ClassificationResult } from '../../src/types';

describe('DecisionEngine', () => {
  let decisionEngine: DecisionEngine;
  
  beforeEach(() => {
    decisionEngine = new DecisionEngine({
      thresholds: {
        routeThreshold: 0.8,
        fallbackThreshold: 0.3,
        clarificationEnabled: true
      }
    });
  });
  
  describe('decide', () => {
    it('should route when confidence is above route threshold', async () => {
      const classification: ClassificationResult = {
        predictions: [
          { label: 'intent_a', confidence: 0.9 },
          { label: 'intent_b', confidence: 0.1 }
        ]
      };
      
      const decision = await decisionEngine.decide(classification);
      
      expect(decision.type).toBe('ROUTE');
      expect(decision.target).toBe('intent_a');
    });
    
    it('should clarify when confidence is in clarification range', async () => {
      const classification: ClassificationResult = {
        predictions: [
          { label: 'intent_a', confidence: 0.6 },
          { label: 'intent_b', confidence: 0.4 }
        ]
      };
      
      const decision = await decisionEngine.decide(classification);
      
      expect(decision.type).toBe('CLARIFY');
      expect(decision.options).toContain('intent_a');
      expect(decision.options).toContain('intent_b');
    });
    
    it('should fallback when confidence is below fallback threshold', async () => {
      const classification: ClassificationResult = {
        predictions: [
          { label: 'intent_a', confidence: 0.2 },
          { label: 'intent_b', confidence: 0.15 }
        ]
      };
      
      const decision = await decisionEngine.decide(classification);
      
      expect(decision.type).toBe('FALLBACK');
    });
  });
});
```

### Integration Test Example
```typescript
// tests/integration/RouterIntegration.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { ConfidenceRouter } from '../../src';
import { MockClassifier } from '../mocks/MockClassifier';

describe('Router Integration', () => {
  let router: ConfidenceRouter;
  let mockClassifier: MockClassifier;
  
  beforeAll(async () => {
    mockClassifier = new MockClassifier();
    router = new ConfidenceRouter({
      thresholds: {
        routeThreshold: 0.8,
        fallbackThreshold: 0.3
      },
      defaultClassifier: 'mock'
    });
    
    router.registerClassifier(mockClassifier);
  });
  
  it('should process classification through full pipeline', async () => {
    const result = await router.process('test input');
    
    expect(result).toBeDefined();
    expect(result.decision).toBeDefined();
    expect(result.classification).toBeDefined();
  });
  
  it('should handle classifier errors gracefully', async () => {
    mockClassifier.setErrorMode(true);
    
    const result = await router.process('test input');
    
    expect(result.decision.type).toBe('FALLBACK');
    expect(result.error).toBeDefined();
  });
});
```

### Performance Test Example
```typescript
// tests/performance/Performance.test.ts
import { describe, it, expect, bench } from 'vitest';
import { ConfidenceRouter } from '../../src';

describe('Performance Benchmarks', () => {
  const router = new ConfidenceRouter({
    thresholds: {
      routeThreshold: 0.8,
      fallbackThreshold: 0.3
    }
  });
  
  bench('decision engine < 10ms', async () => {
    const classification = {
      predictions: [
        { label: 'intent_a', confidence: 0.85 },
        { label: 'intent_b', confidence: 0.15 }
      ]
    };
    
    const start = performance.now();
    await router.decide(classification);
    const end = performance.now();
    
    expect(end - start).toBeLessThan(10);
  });
  
  bench('batch processing performance', async () => {
    const classifications = Array.from({ length: 100 }, () => ({
      predictions: [
        { label: 'intent_a', confidence: Math.random() },
        { label: 'intent_b', confidence: Math.random() }
      ]
    }));
    
    const start = performance.now();
    await Promise.all(classifications.map(c => router.decide(c)));
    const end = performance.now();
    
    expect(end - start).toBeLessThan(1000); // 1 second for 100 decisions
  });
});
```

### Test Data Factory
```typescript
// tests/factories/ClassificationFactory.ts
import { faker } from '@faker-js/faker';

export class ClassificationFactory {
  static create(overrides?: Partial<ClassificationResult>): ClassificationResult {
    const defaultPredictions = [
      { label: faker.lorem.word(), confidence: 0.9 },
      { label: faker.lorem.word(), confidence: 0.08 },
      { label: faker.lorem.word(), confidence: 0.02 }
    ];
    
    return {
      predictions: overrides?.predictions || defaultPredictions,
      metadata: overrides?.metadata || {
        model: 'test-model',
        latency: 100
      }
    };
  }
  
  static createHighConfidence(): ClassificationResult {
    return this.create({
      predictions: [
        { label: 'high_confidence_intent', confidence: 0.95 },
        { label: 'other_intent', confidence: 0.05 }
      ]
    });
  }
  
  static createLowConfidence(): ClassificationResult {
    return this.create({
      predictions: [
        { label: 'low_confidence_intent', confidence: 0.35 },
        { label: 'other_intent', confidence: 0.33 },
        { label: 'another_intent', confidence: 0.32 }
      ]
    });
  }
}
```

## Output Artifacts

### Test Structure
```
tests/
├── unit/
│   ├── DecisionEngine.test.ts
│   ├── ConfigManager.test.ts
│   ├── LanguageManager.test.ts
│   └── classifiers/
│       ├── LLMClassifier.test.ts
│       ├── EmbeddingClassifier.test.ts
│       └── KeywordClassifier.test.ts
├── integration/
│   ├── RouterIntegration.test.ts
│   ├── ClassifierIntegration.test.ts
│   └── LanguageIntegration.test.ts
├── e2e/
│   ├── basic-routing.e2e.ts
│   ├── multi-language.e2e.ts
│   └── evaluation.e2e.ts
├── performance/
│   ├── decision-engine.perf.ts
│   ├── classifier-performance.perf.ts
│   └── batch-processing.perf.ts
├── factories/
│   ├── ClassificationFactory.ts
│   ├── RouterFactory.ts
│   └── ConfigFactory.ts
├── mocks/
│   ├── MockClassifier.ts
│   ├── MockLanguageManager.ts
│   └── MockConfigManager.ts
└── fixtures/
    ├── classifications.json
    ├── configurations.json
    └── datasets/
```

### Test Utilities
```typescript
// tests/utils/testHelpers.ts
export const testHelpers = {
  async waitForDecision(router: ConfidenceRouter, input: string): Promise<RoutingDecision> {
    const classification = await router.classify(input);
    return router.decide(classification);
  },
  
  createMockClassification(confidence: number): ClassificationResult {
    return {
      predictions: [
        { label: 'test_intent', confidence },
        { label: 'other_intent', confidence: 1 - confidence }
      ]
    };
  },
  
  measureExecutionTime<T>(fn: () => Promise<T>): Promise<{ result: T; time: number }> {
    const start = performance.now();
    return fn().then(result => ({
      result,
      time: performance.now() - start
    }));
  }
};
```

### Test Coverage Configuration
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      threshold: {
        global: {
          statements: 95,
          branches: 90,
          functions: 95,
          lines: 95
        }
      },
      include: ['src/**/*.ts'],
      exclude: [
        'src/types/**',
        '**/*.d.ts',
        '**/node_modules/**'
      ]
    }
  }
});
```

## Quality Standards

### Test Quality
- >95% code coverage
- All critical paths tested
- Edge cases covered
- Error scenarios tested
- Performance validated

### Code Quality
- 100% TypeScript strict mode
- Comprehensive test documentation
- Maintainable test structure
- Reusable test utilities
- Clear test naming

### Performance
- Unit tests: <100ms each
- Integration tests: <1s each
- E2E tests: <10s each
- Full test suite: <5 minutes
- Parallel test execution

## Error Handling

### Test Errors
```typescript
enum TestError {
  TEST_SETUP_FAILED = 'TEST_SETUP_FAILED',
  ASSERTION_FAILED = 'ASSERTION_FAILED',
  TIMEOUT_EXCEEDED = 'TIMEOUT_EXCEEDED',
  MOCK_ERROR = 'MOCK_ERROR',
  FIXTURE_ERROR = 'FIXTURE_ERROR'
}
```

### Recovery Strategies
- Automatic test retry
- Detailed error reporting
- Test isolation
- Cleanup on failure
- Error categorization

## Testing Types

### Unit Tests
- Function-level testing
- Component isolation
- Mock dependencies
- Fast execution
- High coverage

### Integration Tests
- Component interaction
- API testing
- Database testing
- Service integration
- Workflow validation

### End-to-End Tests
- User scenarios
- Full workflow testing
- Real environment simulation
- Regression testing
- Smoke testing

### Performance Tests
- Load testing
- Stress testing
- Scalability testing
- Benchmark testing
- Resource usage testing

## Integration Points

### With Other Agents
- **All Agents**: Test their implementations
- **Core Engine Agent**: Test core functionality
- **Classifier Agent**: Test classifier integration
- **DevOps Agent**: Test deployment processes

### External Tools
- Vitest for testing
- Faker for test data
- Coverage tools
- Performance monitoring
- CI/CD integration

## Maintenance

### Test Maintenance
- Regular test updates
- Flaky test identification
- Test optimization
- Coverage monitoring
- Performance tracking

### Quality Assurance
- Test review processes
- Coverage analysis
- Performance monitoring
- Error tracking
- Test effectiveness measurement

## Support

### Testing Resources
- Testing guides
- Best practices
- Example tests
- Troubleshooting guides
- Performance tips

### Community
- Test contribution program
- Review processes
- Knowledge sharing
- Tool recommendations
- Pattern libraries

---

**Agent Version**: 1.0.0  
**Last Updated**: 2026-04-22  
**Status**: Active
