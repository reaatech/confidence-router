import type { Prediction, LanguageConfig } from '../types/index.js';
import type { LanguageManager } from './LanguageManager.js';

/**
 * Generates localized clarification prompts from prediction options.
 */
export class PromptGenerator {
  constructor(private languageManager: LanguageManager) {}

  /**
   * Generates a clarification prompt in the specified language.
   *
   * @param predictions - Array of predictions to present as options
   * @param languageCode - ISO 639-1 language code
   * @param customTemplate - Optional custom template string (uses `{options}` placeholder)
   * @param maxOptions - Maximum number of options to include
   * @returns The formatted clarification prompt
   */
  generate(
    predictions: Prediction[],
    languageCode: string,
    customTemplate?: string,
    maxOptions?: number
  ): string {
    const language = this.languageManager.getLanguage(languageCode);
    const topPredictions = predictions
      .slice()
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, maxOptions ?? 3);

    const options = this.formatOptions(topPredictions, language);
    const template = customTemplate ?? language.clarificationTemplates.basic;

    return template.replace('{options}', options);
  }

  private formatOptions(predictions: Prediction[], language: LanguageConfig): string {
    const labels = predictions.map((p) => p.label);
    const { listSeparator } = language.formatting;

    if (labels.length === 1) {
      return labels[0];
    }

    if (labels.length === 2) {
      const conj = language.formatting.conjunction;
      if (conj) {
        return `${labels[0]} ${conj} ${labels[1]}`;
      }
      return `${labels[0]}${listSeparator}${labels[1]}`;
    }

    const last = labels[labels.length - 1];
    const rest = labels.slice(0, -1).join(listSeparator);
    const conj = language.formatting.conjunction;
    if (conj) {
      return `${rest}${listSeparator}${conj} ${last}`;
    }
    return `${rest}${listSeparator}${last}`;
  }
}
