import type { LanguageConfig } from '@reaatech/confidence-router-core';

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
