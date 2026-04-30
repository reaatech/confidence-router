import type { LanguageConfig } from '@reaatech/confidence-router-core';

export const hebrewConfig: LanguageConfig = {
  code: 'he',
  name: 'Hebrew',
  nativeName: 'עברית',
  direction: 'rtl',
  clarificationTemplates: {
    basic: 'האם התכוונת ל: {options}?',
  },
  formatting: {
    listSeparator: ', ',
    conjunction: 'או',
  },
};
