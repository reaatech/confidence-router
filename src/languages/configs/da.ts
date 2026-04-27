import type { LanguageConfig } from '../../types/index.js';

export const danishConfig: LanguageConfig = {
  code: 'da',
  name: 'Danish',
  nativeName: 'Dansk',
  direction: 'ltr',
  clarificationTemplates: {
    basic: 'Mente du: {options}?',
  },
  formatting: {
    listSeparator: ', ',
    conjunction: 'eller',
  },
};
