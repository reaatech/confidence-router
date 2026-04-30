import type { LanguageConfig, Prediction } from '@reaatech/confidence-router-core';
import type { LanguageManager } from './LanguageManager.js';

export class PromptGenerator {
  constructor(private languageManager: LanguageManager) {}

  generate(
    predictions: Prediction[],
    languageCode: string,
    customTemplate?: string,
    maxOptions?: number,
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
