import type { ClassificationResult, Classifier, Prediction } from '../types/index.js';
import { RouterError, RouterErrorType } from '../types/errors.js';

export type LLMProvider = 'openai' | 'anthropic';

export interface LLMClassifierOptions {
  name?: string;
  priority?: number;
  enabled?: boolean;
  provider: LLMProvider;
  apiKey?: string;
  model?: string;
  baseUrl?: string;
  labels: string[];
  timeout?: number;
  retries?: number;
  systemPrompt?: string;
}

interface LLMPrediction {
  label: string;
  confidence: number;
}

/**
 * LLM-based classifier that uses OpenAI or Anthropic chat completions
 * to classify input text into a set of predefined labels.
 *
 * Uses native `fetch` (Node 18+). No external SDK dependencies.
 *
 * @example
 * ```typescript
 * const classifier = new LLMClassifier({
 *   provider: 'openai',
 *   apiKey: process.env.OPENAI_API_KEY,
 *   model: 'gpt-4o-mini',
 *   labels: ['book_flight', 'check_status', 'cancel_booking'],
 * });
 *
 * const result = await classifier.classify('I want to fly to Paris');
 * ```
 */
export class LLMClassifier implements Classifier {
  name: string;
  type = 'llm';
  enabled: boolean;
  priority: number;
  private provider: LLMProvider;
  private apiKey: string;
  private model: string;
  private baseUrl: string;
  private labels: string[];
  private timeout: number;
  private retries: number;
  private systemPrompt: string;

  constructor(options: LLMClassifierOptions) {
    this.name = options.name ?? 'llm';
    this.priority = options.priority ?? 1;
    this.enabled = options.enabled ?? true;
    this.provider = options.provider;
    this.apiKey = this.resolveApiKey(options);
    this.model = options.model ?? this.defaultModel();
    this.baseUrl = options.baseUrl ?? this.defaultBaseUrl();
    this.labels = options.labels;
    this.timeout = options.timeout ?? 30000;
    this.retries = options.retries ?? 2;
    this.systemPrompt = options.systemPrompt ?? this.defaultSystemPrompt();
    this.validateConfig();
  }

  async classify(input: string, _context?: Record<string, unknown>): Promise<ClassificationResult> {
    const responseText = await this.callLLM(input);
    const predictions = this.parsePredictions(responseText);

    return {
      predictions,
      metadata: {
        classifier: this.name,
        type: this.type,
        provider: this.provider,
        model: this.model,
      },
    };
  }

  async validate(): Promise<boolean> {
    this.validateConfig();
    return true;
  }

  private resolveApiKey(options: LLMClassifierOptions): string {
    if (options.apiKey) return options.apiKey;

    const envVar = options.provider === 'openai' ? 'OPENAI_API_KEY' : 'ANTHROPIC_API_KEY';
    const key = typeof process !== 'undefined' ? process.env?.[envVar] : undefined;

    if (!key) {
      throw new RouterError(
        RouterErrorType.CONFIGURATION_ERROR,
        `LLMClassifier (${options.provider}) requires an apiKey option or ${envVar} environment variable`
      );
    }

    return key;
  }

  private defaultModel(): string {
    return this.provider === 'openai' ? 'gpt-4o-mini' : 'claude-3-haiku-20240307';
  }

  private defaultBaseUrl(): string {
    return this.provider === 'openai'
      ? 'https://api.openai.com/v1'
      : 'https://api.anthropic.com/v1';
  }

  private defaultSystemPrompt(): string {
    return `You are a classification engine. Given a user input and a list of possible labels, return a JSON object with a "predictions" array. Each prediction must have a "label" (string) and "confidence" (number between 0 and 1). Only use labels from the provided list. Sort by confidence descending. Sum of confidences should equal 1.0. Respond with ONLY the JSON object, no markdown.`;
  }

  private validateConfig(): void {
    if (!this.labels || this.labels.length === 0) {
      throw new RouterError(
        RouterErrorType.CONFIGURATION_ERROR,
        'LLMClassifier requires at least one label'
      );
    }

    const seen = new Set<string>();
    for (const label of this.labels) {
      if (!label || typeof label !== 'string') {
        throw new RouterError(
          RouterErrorType.CONFIGURATION_ERROR,
          'LLMClassifier labels must be non-empty strings'
        );
      }
      if (seen.has(label)) {
        throw new RouterError(
          RouterErrorType.CONFIGURATION_ERROR,
          `Duplicate label in LLMClassifier: ${label}`
        );
      }
      seen.add(label);
    }

    if (this.timeout <= 0) {
      throw new RouterError(
        RouterErrorType.CONFIGURATION_ERROR,
        'LLMClassifier timeout must be positive'
      );
    }

    if (this.retries < 0) {
      throw new RouterError(
        RouterErrorType.CONFIGURATION_ERROR,
        'LLMClassifier retries must be >= 0'
      );
    }
  }

  private async callLLM(input: string): Promise<string> {
    const userPrompt = `Labels: [${this.labels.map((l) => `"${l}"`).join(', ')}]\nInput: "${input}"`;
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= this.retries; attempt++) {
      try {
        const result = await (this.provider === 'openai'
          ? this.callOpenAI(userPrompt)
          : this.callAnthropic(userPrompt));
        return result;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        if (attempt === this.retries) {
          throw new RouterError(
            RouterErrorType.CLASSIFICATION_ERROR,
            `LLMClassifier failed after ${this.retries + 1} attempts: ${lastError.message}`
          );
        }
        // Simple exponential backoff
        await this.delay(1000 * Math.pow(2, attempt));
      }
    }

    throw (
      lastError ??
      new RouterError(RouterErrorType.CLASSIFICATION_ERROR, 'Unexpected LLM call failure')
    );
  }

  private async callOpenAI(userPrompt: string): Promise<string> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: this.systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0,
          response_format: { type: 'json_object' },
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`OpenAI API error ${response.status}: ${text}`);
      }

      const data = (await response.json()) as {
        choices: Array<{ message: { content: string } }>;
      };

      if (!Array.isArray(data.choices) || data.choices.length === 0) {
        throw new Error('OpenAI response missing choices array');
      }

      const content = data.choices[0].message?.content;
      if (typeof content !== 'string') {
        throw new Error('OpenAI response missing message content');
      }

      return content;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private async callAnthropic(userPrompt: string): Promise<string> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: 1024,
          system: this.systemPrompt,
          messages: [{ role: 'user', content: userPrompt }],
          temperature: 0,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Anthropic API error ${response.status}: ${text}`);
      }

      const data = (await response.json()) as {
        content: Array<{ type: string; text: string }>;
      };

      if (!Array.isArray(data.content) || data.content.length === 0) {
        throw new Error('Anthropic response missing content array');
      }

      const textBlock = data.content.find((c) => c.type === 'text');
      if (!textBlock) {
        throw new Error('Anthropic response contained no text block');
      }

      return textBlock.text;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private parsePredictions(raw: string): Prediction[] {
    let cleaned = raw.trim();

    // Strip markdown code fences if present
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
    }

    let parsed: { predictions?: LLMPrediction[] };
    try {
      parsed = JSON.parse(cleaned) as { predictions?: LLMPrediction[] };
    } catch (err) {
      throw new RouterError(
        RouterErrorType.CLASSIFICATION_ERROR,
        `LLM returned invalid JSON: ${err instanceof Error ? err.message : String(err)}`
      );
    }

    if (!Array.isArray(parsed.predictions)) {
      throw new RouterError(
        RouterErrorType.CLASSIFICATION_ERROR,
        'LLM response missing "predictions" array'
      );
    }

    const predictions: Prediction[] = [];
    for (const p of parsed.predictions) {
      if (!this.labels.includes(p.label)) {
        throw new RouterError(
          RouterErrorType.CLASSIFICATION_ERROR,
          `LLM returned unknown label: ${p.label}`
        );
      }

      const confidence =
        typeof p.confidence === 'number' && !isNaN(p.confidence)
          ? Math.max(0, Math.min(1, p.confidence))
          : 0;

      predictions.push({ label: p.label, confidence });
    }

    // Ensure all labels are present (fill missing with 0)
    const seen = new Set(predictions.map((p) => p.label));
    for (const label of this.labels) {
      if (!seen.has(label)) {
        predictions.push({ label, confidence: 0 });
      }
    }

    predictions.sort((a, b) => b.confidence - a.confidence);
    return predictions;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
