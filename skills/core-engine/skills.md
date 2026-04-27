# Core Engine Agent

## Purpose
Implement the decision engine and routing logic that forms the heart of the confidence-router system, including threshold comparison, decision tree evaluation, and routing algorithms.

## Capabilities

### Decision Engine Implementation
- Implement core routing logic with configurable thresholds
- Create threshold comparison engine
- Build decision tree evaluation system
- Implement routing decision algorithms (ROUTE, CLARIFY, FALLBACK)

### Type System Design
- Define ClassificationResult interface
- Define RoutingDecision types
- Define ThresholdConfig interface
- Define Prediction and Confidence types

### Configuration System
- Implement configuration loader and validator
- Create configuration schema validation
- Support environment variable overrides
- Implement configuration hot-reloading

### Decision Flow Implementation
```typescript
// Core decision logic
interface DecisionEngine {
  decide(classification: ClassificationResult): Promise<RoutingDecision>;
  evaluateThresholds(score: number): DecisionType;
  generateClarification(decision: ClarifyDecision): Promise<string>;
}
```

### Error Handling
- Implement comprehensive error types
- Create error recovery mechanisms
- Add validation for all inputs
- Implement graceful degradation

## Triggers
- Core functionality development
- Algorithm implementation
- Performance optimization
- Bug fixes in decision logic

## Dependencies
- Project Setup Agent (for project structure)
- Testing Agent (for test implementation)

## Configuration

### Threshold Configuration
```typescript
interface ThresholdConfig {
  routeThreshold: number;        // 0.8 = 80% confidence to route
  fallbackThreshold: number;     // 0.3 = 30% confidence to fallback
  clarificationEnabled: boolean; // Enable clarification decisions
  clarificationMinScore: number; // Minimum score for clarification
  clarificationMaxOptions: number; // Max options to show
}
```

### Decision Configuration
```typescript
interface DecisionConfig {
  strategy: 'strict' | 'balanced' | 'lenient';
  fallbackBehavior: 'default' | 'error' | 'retry';
  clarificationBehavior: 'always' | 'when-unsure' | 'never';
  maxDecisionTime: number; // milliseconds
}
```

## Examples

### Basic Decision Engine
```typescript
class ConfidenceRouter {
  private config: RouterConfig;
  
  constructor(config: RouterConfig) {
    this.config = config;
  }
  
  async decide(classification: ClassificationResult): Promise<RoutingDecision> {
    const topPrediction = classification.predictions[0];
    const decisionType = this.evaluateThresholds(topPrediction.confidence);
    
    switch (decisionType) {
      case 'ROUTE':
        return this.createRouteDecision(topPrediction);
      case 'CLARIFY':
        return this.createClarifyDecision(classification);
      case 'FALLBACK':
        return this.createFallbackDecision();
    }
  }
  
  private evaluateThresholds(score: number): DecisionType {
    const { routeThreshold, fallbackThreshold } = this.config.thresholds;
    
    if (score >= routeThreshold) {
      return 'ROUTE';
    } else if (score < fallbackThreshold) {
      return 'FALLBACK';
    } else {
      return 'CLARIFY';
    }
  }
}
```

### Threshold Evaluation
```typescript
// Decision tree logic
function evaluateDecision(score: number, thresholds: ThresholdConfig): DecisionType {
  // High confidence → Route to top match
  if (score >= thresholds.routeThreshold) {
    return 'ROUTE';
  }
  
  // Very low confidence → Fall back to default
  if (score < thresholds.fallbackThreshold) {
    return 'FALLBACK';
  }
  
  // Medium confidence → Ask for clarification
  if (thresholds.clarificationEnabled) {
    return 'CLARIFY';
  }
  
  // If clarification disabled, fall back
  return 'FALLBACK';
}
```

## Output Artifacts

### Core Types
```typescript
// src/types/routing.ts
export interface ClassificationResult {
  predictions: Prediction[];
  metadata?: ClassificationMetadata;
}

export interface Prediction {
  label: string;
  confidence: number;
  metadata?: Record<string, unknown>;
}

export type DecisionType = 'ROUTE' | 'CLARIFY' | 'FALLBACK';

export interface RoutingDecision {
  type: DecisionType;
  confidence?: number;
  target?: string;
  prompt?: string;
  options?: string[];
  metadata?: DecisionMetadata;
}
```

### Decision Engine
```typescript
// src/core/DecisionEngine.ts
export class DecisionEngine {
  constructor(private config: RouterConfig) {}
  
  async process(classification: ClassificationResult): Promise<RoutingDecision> {
    // Validate input
    this.validate(classification);
    
    // Get top prediction
    const topPrediction = this.getTopPrediction(classification);
    
    // Evaluate thresholds
    const decisionType = this.evaluateThresholds(topPrediction.confidence);
    
    // Create appropriate decision
    return this.createDecision(decisionType, classification, topPrediction);
  }
}
```

### Configuration Manager
```typescript
// src/config/ConfigManager.ts
export class ConfigManager {
  private config: RouterConfig;
  
  constructor(configPath?: string) {
    this.config = this.loadConfig(configPath);
  }
  
  private loadConfig(configPath?: string): RouterConfig {
    // Load from file, environment, or defaults
    const fileConfig = this.loadFileConfig(configPath);
    const envConfig = this.loadEnvConfig();
    
    return this.mergeConfigs(fileConfig, envConfig, this.getDefaultConfig());
  }
}
```

## Quality Standards

### Code Quality
- 100% TypeScript strict mode compliance
- Comprehensive error handling
- Extensive input validation
- Clear separation of concerns

### Performance
- Decision time < 10ms
- Memory efficient data structures
- Optimized threshold comparisons
- Minimal object allocations

### Testing
- Unit tests for all decision paths
- Integration tests for workflows
- Performance benchmarks
- Edge case testing

## Error Handling

### Error Types
```typescript
enum CoreEngineError {
  INVALID_CLASSIFICATION = 'INVALID_CLASSIFICATION',
  THRESHOLD_ERROR = 'THRESHOLD_ERROR',
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR',
  DECISION_TIMEOUT = 'DECISION_TIMEOUT'
}
```

### Recovery Strategies
- Default threshold fallback
- Configuration validation before use
- Graceful degradation on errors
- Detailed error logging

## Performance Optimization

### Optimization Techniques
- Threshold caching
- Decision result caching
- Lazy loading of configurations
- Efficient data structure usage

### Performance Monitoring
- Decision time tracking
- Memory usage monitoring
- Error rate tracking
- Throughput measurement

## Integration Points

### With Other Agents
- **Multi-Language Agent**: Provides clarification prompts
- **Classifier Agent**: Receives classification results
- **Evaluation Agent**: Provides metrics for optimization
- **Testing Agent**: Implements comprehensive tests

### External Systems
- Configuration files (JSON, YAML)
- Environment variables
- External classifiers
- Monitoring systems

## Maintenance

### Code Maintenance
- Regular refactoring
- Performance optimization
- Security updates
- Documentation updates

### Monitoring
- Decision accuracy
- Performance metrics
- Error rates
- Resource usage

## Support

### Documentation
- API documentation
- Configuration guides
- Troubleshooting guides
- Performance tuning guides

### Community
- GitHub Issues for bugs
- GitHub Discussions for questions
- Contributing guidelines
- Code examples

---

**Agent Version**: 1.0.0  
**Last Updated**: 2026-04-22  
**Status**: Active
