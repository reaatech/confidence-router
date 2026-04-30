import type { LanguageConfig } from '@reaatech/confidence-router-core';

export const serbianConfig: LanguageConfig = {
  code: 'sr',
  name: 'Serbian',
  nativeName: 'Српски',
  direction: 'ltr',
  clarificationTemplates: {
    basic: 'Да ли сте мислили: {options}?',
  },
  formatting: {
    listSeparator: ', ',
    conjunction: 'или',
  },
};
