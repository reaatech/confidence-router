import type { LanguageConfig } from '../../types/index.js';

export const slovakConfig: LanguageConfig = {
  code: 'sk',
  name: 'Slovak',
  nativeName: 'Slovenčina',
  direction: 'ltr',
  clarificationTemplates: {
    basic: 'Mysleli ste: {options}?',
  },
  formatting: {
    listSeparator: ', ',
    conjunction: 'alebo',
  },
};
