import type { LanguageConfig } from '../../types/index.js';

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
