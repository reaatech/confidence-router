import type { LanguageConfig } from '../../types/index.js';

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
