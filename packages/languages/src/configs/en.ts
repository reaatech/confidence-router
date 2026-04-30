import type { LanguageConfig } from '@reaatech/confidence-router-core';

export const englishConfig: LanguageConfig = {
  code: 'en',
  name: 'English',
  nativeName: 'English',
  direction: 'ltr',
  clarificationTemplates: {
    basic: 'Did you mean: {options}?',
  },
  formatting: {
    listSeparator: ', ',
    conjunction: 'or',
  },
};
