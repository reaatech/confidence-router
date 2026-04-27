import type { LanguageConfig } from '../types/index.js';
import { RouterError, RouterErrorType } from '../types/errors.js';
import { englishConfig } from './configs/en.js';
import { spanishConfig } from './configs/es.js';
import { frenchConfig } from './configs/fr.js';
import { germanConfig } from './configs/de.js';
import { italianConfig } from './configs/it.js';
import { portugueseConfig } from './configs/pt.js';
import { dutchConfig } from './configs/nl.js';
import { russianConfig } from './configs/ru.js';
import { japaneseConfig } from './configs/ja.js';
import { koreanConfig } from './configs/ko.js';
import { chineseSimplifiedConfig } from './configs/zh-cn.js';
import { chineseTraditionalConfig } from './configs/zh-tw.js';
import { arabicConfig } from './configs/ar.js';
import { hindiConfig } from './configs/hi.js';
import { turkishConfig } from './configs/tr.js';
import { polishConfig } from './configs/pl.js';
import { swedishConfig } from './configs/sv.js';
import { norwegianConfig } from './configs/no.js';
import { danishConfig } from './configs/da.js';
import { finnishConfig } from './configs/fi.js';
import { czechConfig } from './configs/cs.js';
import { greekConfig } from './configs/el.js';
import { hebrewConfig } from './configs/he.js';
import { thaiConfig } from './configs/th.js';
import { vietnameseConfig } from './configs/vi.js';
import { indonesianConfig } from './configs/id.js';
import { romanianConfig } from './configs/ro.js';
import { bulgarianConfig } from './configs/bg.js';
import { croatianConfig } from './configs/hr.js';
import { serbianConfig } from './configs/sr.js';
import { slovenianConfig } from './configs/sl.js';
import { hungarianConfig } from './configs/hu.js';
import { slovakConfig } from './configs/sk.js';
import { ukrainianConfig } from './configs/uk.js';
import { bengaliConfig } from './configs/bn.js';
import { tamilConfig } from './configs/ta.js';
import { teluguConfig } from './configs/te.js';
import { marathiConfig } from './configs/mr.js';
import { gujaratiConfig } from './configs/gu.js';
import { kannadaConfig } from './configs/kn.js';
import { malayalamConfig } from './configs/ml.js';
import { malayConfig } from './configs/ms.js';
import { filipinoConfig } from './configs/fil.js';
import { persianConfig } from './configs/fa.js';
import { urduConfig } from './configs/ur.js';
import { swahiliConfig } from './configs/sw.js';
import { afrikaansConfig } from './configs/af.js';

/**
 * Manages language configurations for clarification prompt generation.
 * Includes 47 built-in languages with automatic fallback to English.
 */
export class LanguageManager {
  private languages: Map<string, LanguageConfig> = new Map();
  private defaultLanguage = 'en';

  constructor() {
    this.loadBuiltInLanguages();
  }

  /**
   * Retrieves a language configuration by ISO 639-1 code.
   * Falls back to English if the language is not found.
   *
   * @param code - ISO 639-1 language code (e.g., 'en', 'es', 'ja')
   * @returns The language configuration
   */
  getLanguage(code: string): LanguageConfig {
    const config = this.languages.get(code) ?? this.languages.get(this.defaultLanguage);
    if (!config) {
      throw new RouterError(
        RouterErrorType.LANGUAGE_NOT_SUPPORTED,
        'LanguageManager default language configuration is missing'
      );
    }
    return config;
  }

  /**
   * Adds a custom language configuration.
   *
   * @param config - The language configuration to add
   */
  addLanguage(config: LanguageConfig): void {
    this.languages.set(config.code, config);
  }

  /**
   * Checks whether a language code is supported.
   *
   * @param code - ISO 639-1 language code
   * @returns True if the language is registered
   */
  hasLanguage(code: string): boolean {
    return this.languages.has(code);
  }

  /**
   * Returns a list of all supported language codes.
   */
  getSupportedLanguages(): string[] {
    return Array.from(this.languages.keys());
  }

  private loadBuiltInLanguages(): void {
    const configs = [
      englishConfig,
      spanishConfig,
      frenchConfig,
      germanConfig,
      italianConfig,
      portugueseConfig,
      dutchConfig,
      russianConfig,
      japaneseConfig,
      koreanConfig,
      chineseSimplifiedConfig,
      chineseTraditionalConfig,
      arabicConfig,
      hindiConfig,
      turkishConfig,
      polishConfig,
      swedishConfig,
      norwegianConfig,
      danishConfig,
      finnishConfig,
      czechConfig,
      greekConfig,
      hebrewConfig,
      thaiConfig,
      vietnameseConfig,
      indonesianConfig,
      romanianConfig,
      bulgarianConfig,
      croatianConfig,
      serbianConfig,
      slovenianConfig,
      hungarianConfig,
      slovakConfig,
      ukrainianConfig,
      bengaliConfig,
      tamilConfig,
      teluguConfig,
      marathiConfig,
      gujaratiConfig,
      kannadaConfig,
      malayalamConfig,
      malayConfig,
      filipinoConfig,
      persianConfig,
      urduConfig,
      swahiliConfig,
      afrikaansConfig,
    ];

    for (const config of configs) {
      this.languages.set(config.code, config);
    }
  }
}
