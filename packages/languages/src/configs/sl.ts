import type { LanguageConfig } from '@reaatech/confidence-router-core';

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
