import type { LanguageConfig } from '../../types/index.js';

export const slovenianConfig: LanguageConfig = {
  code: 'sl',
  name: 'Slovenian',
  nativeName: 'Slovenščina',
  direction: 'ltr',
  clarificationTemplates: {
    basic: 'Ali ste mislili: {options}?',
  },
  formatting: {
    listSeparator: ', ',
    conjunction: 'ali',
  },
};
