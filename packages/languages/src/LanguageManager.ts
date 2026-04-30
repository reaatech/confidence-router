import type { LanguageConfig } from '@reaatech/confidence-router-core';
import { RouterError, RouterErrorType } from '@reaatech/confidence-router-core';
import { afrikaansConfig } from './configs/af.js';
import { arabicConfig } from './configs/ar.js';
import { bulgarianConfig } from './configs/bg.js';
import { bengaliConfig } from './configs/bn.js';
import { czechConfig } from './configs/cs.js';
import { danishConfig } from './configs/da.js';
import { germanConfig } from './configs/de.js';
import { greekConfig } from './configs/el.js';
import { englishConfig } from './configs/en.js';
import { spanishConfig } from './configs/es.js';
import { persianConfig } from './configs/fa.js';
import { finnishConfig } from './configs/fi.js';
import { filipinoConfig } from './configs/fil.js';
import { frenchConfig } from './configs/fr.js';
import { gujaratiConfig } from './configs/gu.js';
import { hebrewConfig } from './configs/he.js';
import { hindiConfig } from './configs/hi.js';
import { croatianConfig } from './configs/hr.js';
import { hungarianConfig } from './configs/hu.js';
import { indonesianConfig } from './configs/id.js';
import { italianConfig } from './configs/it.js';
import { japaneseConfig } from './configs/ja.js';
import { kannadaConfig } from './configs/kn.js';
import { koreanConfig } from './configs/ko.js';
import { malayalamConfig } from './configs/ml.js';
import { marathiConfig } from './configs/mr.js';
import { malayConfig } from './configs/ms.js';
import { dutchConfig } from './configs/nl.js';
import { norwegianConfig } from './configs/no.js';
import { polishConfig } from './configs/pl.js';
import { portugueseConfig } from './configs/pt.js';
import { romanianConfig } from './configs/ro.js';
import { russianConfig } from './configs/ru.js';
import { slovakConfig } from './configs/sk.js';
import { slovenianConfig } from './configs/sl.js';
import { serbianConfig } from './configs/sr.js';
import { swedishConfig } from './configs/sv.js';
import { swahiliConfig } from './configs/sw.js';
import { tamilConfig } from './configs/ta.js';
import { teluguConfig } from './configs/te.js';
import { thaiConfig } from './configs/th.js';
import { turkishConfig } from './configs/tr.js';
import { ukrainianConfig } from './configs/uk.js';
import { urduConfig } from './configs/ur.js';
import { vietnameseConfig } from './configs/vi.js';
import { chineseSimplifiedConfig } from './configs/zh-cn.js';
import { chineseTraditionalConfig } from './configs/zh-tw.js';

export class LanguageManager {
  private languages: Map<string, LanguageConfig> = new Map();
  private defaultLanguage = 'en';

  constructor() {
    this.loadBuiltInLanguages();
  }

  getLanguage(code: string): LanguageConfig {
    const config = this.languages.get(code) ?? this.languages.get(this.defaultLanguage);
    if (!config) {
      throw new RouterError(
        RouterErrorType.LANGUAGE_NOT_SUPPORTED,
        'LanguageManager default language configuration is missing',
      );
    }
    return config;
  }

  addLanguage(config: LanguageConfig): void {
    this.languages.set(config.code, config);
  }

  hasLanguage(code: string): boolean {
    return this.languages.has(code);
  }

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
