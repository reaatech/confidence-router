import type { LanguageConfig } from '@reaatech/confidence-router-core';

export const spanishConfig: LanguageConfig = {
  code: 'es',
  name: 'Spanish',
  nativeName: 'Español',
  direction: 'ltr',
  clarificationTemplates: {
    basic: '¿Quisiste decir: {options}?',
  },
  formatting: {
    listSeparator: ', ',
    conjunction: 'o',
  },
};
