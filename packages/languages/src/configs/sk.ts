import type { LanguageConfig } from '@reaatech/confidence-router-core';

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
