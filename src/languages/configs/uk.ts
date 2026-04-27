import type { LanguageConfig } from '../../types/index.js';

export const ukrainianConfig: LanguageConfig = {
  code: 'uk',
  name: 'Ukrainian',
  nativeName: 'Українська',
  direction: 'ltr',
  clarificationTemplates: {
    basic: 'Ви мали на увазі: {options}?',
  },
  formatting: {
    listSeparator: ', ',
    conjunction: 'або',
  },
};
