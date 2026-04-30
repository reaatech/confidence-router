import type { LanguageConfig } from '@reaatech/confidence-router-core';

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
