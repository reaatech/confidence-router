import type { LanguageConfig } from '../../types/index.js';

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
