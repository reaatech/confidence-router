# Classifier Agent

## Purpose
Implement a pluggable classifier system supporting LLM-based, embedding similarity, and keyword-based classifiers with unified interfaces, confidence score calibration, and performance monitoring.

## Capabilities

### Classifier Architecture
- Design and implement classifier interface
- Create classifier registry and factory patterns
- Implement classifier configuration system
- Build classifier result normalization

### Built-in Classifiers

#### 1. LLM-Based Classifier
- OpenAI API integration (GPT-4, GPT-3.5-turbo)
- Anthropic Claude API integration
- Custom LLM endpoint support
- Few-shot learning implementation
- Prompt engineering for classification

#### 2. Embedding Similarity Classifier
- Vector similarity matching
- Cosine similarity calculations
- Multiple embedding model support (OpenAI, Cohere, Hugging Face)
- Vector database integration
- Similarity threshold configuration

#### 3. Keyword-Based Classifier
- Pattern matching implementation
- Rule-based confidence scoring
- Regular expression support
- Keyword weight configuration
- Fast, deterministic classification

### Classifier Management
- Classifier lifecycle management
- Performance monitoring and metrics
- Health checking and validation
- Hot-swapping of classifiers
- Fallback chain implementation

## Triggers
- Classifier integration requirements
- AI model implementation
- Performance optimization
- New classifier type addition

## Dependencies
- Core Engine Agent (for decision integration)
- Project Setup Agent (for project structure)
- Evaluation Agent (for performance metrics)

## Configuration

### Classifier Configuration
```typescript
interface ClassifierConfig {
  name: string;
  type: 'llm' | 'embedding' | 'keyword' | 'custom';
  enabled: boolean;
  priority: number;
  
  // Type-specific configs
  llmConfig?: LLMConfig;
  embeddingConfig?: EmbeddingConfig;
  keywordConfig?: KeywordConfig;
  
  // Performance settings
  timeout?: number;
  retries?: number;
  cacheEnabled?: boolean;
}
```

### LLM Configuration
```typescript
interface LLMConfig {
  provider: 'openai' | 'anthropic' | 'custom';
  model: string;
  apiKey: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  fewShotExamples?: FewShotExample[];
}
```

### Embedding Configuration
```typescript
interface EmbeddingConfig {
  provider: 'openai' | 'cohere' | 'huggingface' | 'custom';
  model: string;
  apiKey?: string;
  similarityThreshold?: number;
  vectorDatabase?: VectorDBConfig;
}
```

### Keyword Configuration
```typescript
interface KeywordConfig {
  patterns: KeywordPattern[];
  defaultConfidence?: number;
  caseSensitive?: boolean;
  weights?: Record<string, number>;
}
```

## Examples

### Classifier Interface
```typescript
// src/classifiers/Classifier.ts
export interface Classifier {
  name: string;
  type: string;
  
  classify(input: string, context?: Record<string, unknown>): Promise<ClassificationResult>;
  validate(): Promise<boolean>;
  getMetrics(): ClassifierMetrics;
  healthCheck(): Promise<HealthStatus>;
}

export interface ClassificationResult {
  predictions: Prediction[];
  metadata?: {
    model?: string;
    latency?: number;
    tokens?: number;
    confidence?: number;
  } & Record<string, unknown>;
}
```

### LLM Classifier Implementation
```typescript
// src/classifiers/LLMClassifier.ts
export class LLMClassifier implements Classifier {
  name = 'llm-classifier';
  type = 'llm';
  
  constructor(private config: LLMConfig) {}
  
  async classify(input: string, context?: any): Promise<ClassificationResult> {
    const prompt = this.buildPrompt(input, context);
    
    const response = await this.callLLM(prompt);
    return this.parseResponse(response);
  }
  
  private buildPrompt(input: string, context?: any): string {
    let prompt = this.config.systemPrompt || '';
    
    // Add few-shot examples
    if (this.config.fewShotExamples?.length) {
      prompt += '\n\nExamples:\n';
      this.config.fewShotExamples.forEach(example => {
        prompt += `Input: ${example.input}\nOutput: ${example.output}\n\n`;
      });
    }
    
    prompt += `\nClassify the following: ${input}`;
    return prompt;
  }
}
```

### Embedding Classifier Implementation
```typescript
// src/classifiers/EmbeddingClassifier.ts
export class EmbeddingClassifier implements Classifier {
  name = 'embedding-classifier';
  type = 'embedding';
  
  constructor(private config: EmbeddingConfig) {
    this.initializeEmbeddings();
  }
  
  async classify(input: string, context?: any): Promise<ClassificationResult> {
    const inputEmbedding = await this.getEmbedding(input);
    const similarities = await this.calculateSimilarities(inputEmbedding);
    
    return this.createClassificationResult(similarities);
  }
  
  private async calculateSimilarities(
    inputEmbedding: number[]
  ): Promise<SimilarityResult[]> {
    const results: SimilarityResult[] = [];
    
    for (const label of this.knownLabels) {
      const labelEmbedding = await this.getLabelEmbedding(label);
      const similarity = this.cosineSimilarity(inputEmbedding, labelEmbedding);
      
      results.push({ label, similarity });
    }
    
    return results.sort((a, b) => b.similarity - a.similarity);
  }
}
```

### Keyword Classifier Implementation
```typescript
// src/classifiers/KeywordClassifier.ts
export class KeywordClassifier implements Classifier {
  name = 'keyword-classifier';
  type = 'keyword';
  
  constructor(private config: KeywordConfig) {}
  
  classify(input: string, context?: Record<string, unknown>): Promise<ClassificationResult> {
    const predictions = this.matchPatterns(input);
    return Promise.resolve({ predictions });
  }
  
  private matchPatterns(input: string): Prediction[] {
    const scores: Record<string, number> = {};
    
    this.config.patterns.forEach(pattern => {
      const matches = input.match(pattern.regex);
      if (matches) {
        scores[pattern.label] = (scores[pattern.label] || 0) + 
          (pattern.weight || 1) * matches.length;
      }
    });
    
    return Object.entries(scores)
      .map(([label, score]) => ({
        label,
        confidence: this.normalizeScore(score)
      }))
      .sort((a, b) => b.confidence - a.confidence);
  }
}
```

### Classifier Registry
```typescript
// src/classifiers/ClassifierRegistry.ts
export class ClassifierRegistry {
  private classifiers: Map<string, Classifier> = new Map();
  private defaultClassifier: string | null = null;
  
  register(classifier: Classifier): void {
    this.classifiers.set(classifier.name, classifier);
    
    if (classifier.enabled && !this.defaultClassifier) {
      this.defaultClassifier = classifier.name;
    }
  }
  
  async classify(
    input: string, 
    context?: any,
    classifierName?: string
  ): Promise<ClassificationResult> {
    const name = classifierName || this.defaultClassifier;
    const classifier = this.classifiers.get(name);
    
    if (!classifier) {
      throw new Error(`Classifier ${name} not found`);
    }
    
    return classifier.classify(input, context);
  }
  
  async getFallbackChain(
    input: string, 
    context?: any
  ): Promise<ClassificationResult> {
    const sortedClassifiers = Array.from(this.classifiers.values())
      .filter(c => c.enabled)
      .sort((a, b) => a.priority - b.priority);
    
    for (const classifier of sortedClassifiers) {
      try {
        return await classifier.classify(input, context);
      } catch (error) {
        console.warn(`Classifier ${classifier.name} failed:`, error);
        continue;
      }
    }
    
    throw new Error('All classifiers failed');
  }
}
```

## Output Artifacts

### Classifier Factory
```typescript
// src/classifiers/ClassifierFactory.ts
export class ClassifierFactory {
  static create(config: ClassifierConfig): Classifier {
    switch (config.type) {
      case 'llm':
        return new LLMClassifier(config.llmConfig!);
      case 'embedding':
        return new EmbeddingClassifier(config.embeddingConfig!);
      case 'keyword':
        return new KeywordClassifier(config.keywordConfig!);
      default:
        throw new Error(`Unknown classifier type: ${config.type}`);
    }
  }
}
```

### Performance Monitor
```typescript
// src/classifiers/PerformanceMonitor.ts
export class PerformanceMonitor {
  private metrics: Map<string, ClassifierMetrics> = new Map();
  
  recordMetrics(classifierName: string, metrics: ClassifierMetrics): void {
    const existing = this.metrics.get(classifierName) || {
      totalCalls: 0,
      successfulCalls: 0,
      averageLatency: 0,
      errors: []
    };
    
    existing.totalCalls++;
    if (metrics.success) existing.successfulCalls++;
    existing.averageLatency = (existing.averageLatency + metrics.latency) / 2;
    
    this.metrics.set(classifierName, existing);
  }
  
  getMetrics(classifierName: string): ClassifierMetrics | undefined {
    return this.metrics.get(classifierName);
  }
}
```

## Quality Standards

### Classifier Quality
- Confidence score calibration
- Consistent prediction quality
- Low latency responses
- High accuracy rates

### Code Quality
- 100% TypeScript strict mode
- Comprehensive error handling
- Extensive classifier testing
- Performance optimization

### Performance
- LLM classifier: <2s response time
- Embedding classifier: <100ms response time
- Keyword classifier: <10ms response time
- 99.9% classifier availability

## Error Handling

### Classifier Errors
```typescript
enum ClassifierError {
  CLASSIFIER_NOT_FOUND = 'CLASSIFIER_NOT_FOUND',
  API_ERROR = 'API_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR'
}
```

### Recovery Strategies
- Automatic retry with exponential backoff
- Fallback to alternative classifiers
- Circuit breaker pattern for failing APIs
- Graceful degradation on errors

## Integration Points

### With Other Agents
- **Core Engine Agent**: Provides classification results
- **Evaluation Agent**: Provides performance metrics
- **Testing Agent**: Implements classifier testing
- **DevOps Agent**: Handles API key management

### External APIs
- OpenAI API
- Anthropic API
- Cohere API
- Hugging Face API
- Custom LLM endpoints

## Maintenance

### Classifier Updates
- Regular model updates
- API version management
- Performance monitoring
- Cost optimization

### Monitoring
- Classifier accuracy
- Response times
- Error rates
- API costs

## Support

### Documentation
- Classifier configuration guides
- API integration guides
- Performance tuning guides
- Troubleshooting guides

### Community
- Classifier contribution program
- Best practices sharing
- Performance benchmarking
- Cost optimization tips

---

**Agent Version**: 1.0.0  
**Last Updated**: 2026-04-22  
**Status**: Active
