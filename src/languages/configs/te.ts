import type { LanguageConfig } from '../../types/index.js';

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
