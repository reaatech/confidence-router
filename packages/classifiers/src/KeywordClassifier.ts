import type {
  ClassificationResult,
  Classifier,
  Prediction,
} from '@reaatech/confidence-router-core';
import { RouterError, RouterErrorType } from '@reaatech/confidence-router-core';

export type MatchMode = 'exact' | 'substring' | 'regex';

export interface KeywordPattern {
  label: string;
  keywords: string[];
  mode?: MatchMode;
  weight?: number;
}

export interface KeywordClassifierOptions {
  name?: string;
  priority?: number;
  enabled?: boolean;
  caseSensitive?: boolean;
}

export class KeywordClassifier implements Classifier {
  name: string;
  type = 'keyword';
  enabled: boolean;
  priority: number;
  private caseSensitive: boolean;

  constructor(
    private patterns: KeywordPattern[],
    options: KeywordClassifierOptions = {},
  ) {
    this.name = options.name ?? 'keyword';
    this.priority = options.priority ?? 1;
    this.enabled = options.enabled ?? true;
    this.caseSensitive = options.caseSensitive ?? false;
    this.validatePatterns();
  }

  async classify(input: string, _context?: Record<string, unknown>): Promise<ClassificationResult> {
    const predictions: Prediction[] = [];

    for (const pattern of this.patterns) {
      const confidence = this.scorePattern(input, pattern);
      if (confidence > 0) {
        predictions.push({
          label: pattern.label,
          confidence,
          metadata: {
            matchedKeywords: this.getMatchedKeywords(input, pattern),
            mode: pattern.mode ?? 'substring',
          },
        });
      }
    }

    predictions.sort((a, b) => b.confidence - a.confidence);

    return {
      predictions,
      metadata: {
        classifier: this.name,
        type: this.type,
      },
    };
  }

  async validate(): Promise<boolean> {
    this.validatePatterns();
    return true;
  }

  private validatePatterns(): void {
    if (!this.patterns || this.patterns.length === 0) {
      throw new RouterError(
        RouterErrorType.CONFIGURATION_ERROR,
        'KeywordClassifier requires at least one pattern',
      );
    }

    const seenLabels = new Set<string>();
    for (const pattern of this.patterns) {
      if (!pattern.label || typeof pattern.label !== 'string') {
        throw new RouterError(
          RouterErrorType.CONFIGURATION_ERROR,
          'Each keyword pattern must have a non-empty label',
        );
      }

      if (seenLabels.has(pattern.label)) {
        throw new RouterError(
          RouterErrorType.CONFIGURATION_ERROR,
          `Duplicate label in keyword patterns: ${pattern.label}`,
        );
      }
      seenLabels.add(pattern.label);

      if (!pattern.keywords || pattern.keywords.length === 0) {
        throw new RouterError(
          RouterErrorType.CONFIGURATION_ERROR,
          `Pattern for "${pattern.label}" must have at least one keyword`,
        );
      }

      for (const keyword of pattern.keywords) {
        if (typeof keyword !== 'string' || keyword.length === 0) {
          throw new RouterError(
            RouterErrorType.CONFIGURATION_ERROR,
            `Invalid keyword for label "${pattern.label}": keywords must be non-empty strings`,
          );
        }
      }

      if (pattern.mode === 'regex') {
        for (const keyword of pattern.keywords) {
          try {
            new RegExp(keyword);
          } catch {
            throw new RouterError(
              RouterErrorType.CONFIGURATION_ERROR,
              `Invalid regex in pattern "${pattern.label}": ${keyword}`,
            );
          }
        }
      }
    }
  }

  private scorePattern(input: string, pattern: KeywordPattern): number {
    const text = this.caseSensitive ? input : input.toLowerCase();
    const keywords = this.caseSensitive
      ? pattern.keywords
      : pattern.keywords.map((k) => k.toLowerCase());

    let matches = 0;
    for (const keyword of keywords) {
      if (this.matchesKeyword(text, keyword, pattern.mode ?? 'substring')) {
        matches++;
      }
    }

    const baseScore = matches / keywords.length;
    const weight = pattern.weight ?? 1;
    return Math.min(1, baseScore * weight);
  }

  private matchesKeyword(text: string, keyword: string, mode: MatchMode): boolean {
    switch (mode) {
      case 'exact':
        return new RegExp(`\\b${this.escapeRegex(keyword)}\\b`).test(text);
      case 'regex':
        return new RegExp(keyword).test(text);
      default:
        return text.includes(keyword);
    }
  }

  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private getMatchedKeywords(input: string, pattern: KeywordPattern): string[] {
    const text = this.caseSensitive ? input : input.toLowerCase();
    const keywords = this.caseSensitive
      ? pattern.keywords
      : pattern.keywords.map((k) => k.toLowerCase());
    const mode = pattern.mode ?? 'substring';

    const matched: string[] = [];
    for (let i = 0; i < keywords.length; i++) {
      if (this.matchesKeyword(text, keywords[i], mode)) {
        matched.push(pattern.keywords[i]);
      }
    }
    return matched;
  }
}
