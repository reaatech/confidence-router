import { describe, it, expect } from 'vitest';
import { PromptGenerator } from '../../src/languages/PromptGenerator.js';
import { LanguageManager } from '../../src/languages/LanguageManager.js';
import type { Prediction } from '../../src/types/index.js';

describe('PromptGenerator', () => {
  const languageManager = new LanguageManager();
  const generator = new PromptGenerator(languageManager);

  const predictions: Prediction[] = [
    { label: 'book_flight', confidence: 0.6 },
    { label: 'check_status', confidence: 0.4 },
    { label: 'cancel_booking', confidence: 0.2 },
  ];

  it('should generate English clarification prompt', () => {
    const prompt = generator.generate(predictions, 'en');

    expect(prompt).toContain('Did you mean');
    expect(prompt).toContain('book_flight');
    expect(prompt).toContain('check_status');
  });

  it('should generate Spanish clarification prompt', () => {
    const prompt = generator.generate(predictions, 'es');

    expect(prompt).toContain('¿Quisiste decir');
  });

  it('should limit options to maxOptions', () => {
    const prompt = generator.generate(predictions, 'en', undefined, 2);

    expect(prompt).toContain('book_flight');
    expect(prompt).toContain('check_status');
    expect(prompt).not.toContain('cancel_booking');
  });

  it('should use custom template when provided', () => {
    const customTemplate = 'Please choose: {options}';
    const prompt = generator.generate(predictions, 'en', customTemplate, 2);

    expect(prompt).toBe('Please choose: book_flight or check_status');
  });

  it('should fallback to English for unknown language', () => {
    const prompt = generator.generate(predictions, 'xx');

    expect(prompt).toContain('Did you mean');
  });

  it('should handle single prediction', () => {
    const singlePrediction: Prediction[] = [{ label: 'book_flight', confidence: 0.6 }];

    const prompt = generator.generate(singlePrediction, 'en');

    expect(prompt).toContain('book_flight');
  });
});
