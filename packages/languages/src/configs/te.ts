import type { LanguageConfig } from '@reaatech/confidence-router-core';

export const teluguConfig: LanguageConfig = {
  code: 'te',
  name: 'Telugu',
  nativeName: 'తెలుగు',
  direction: 'ltr',
  clarificationTemplates: {
    basic: 'మీరు చెప్పదలచుకున్నది: {options}?',
  },
  formatting: {
    listSeparator: ', ',
    conjunction: 'లేదా',
  },
};
