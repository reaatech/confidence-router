import type { LanguageConfig } from '@reaatech/confidence-router-core';

export const norwegianConfig: LanguageConfig = {
  code: 'no',
  name: 'Norwegian',
  nativeName: 'Norsk',
  direction: 'ltr',
  clarificationTemplates: {
    basic: 'Mente du: {options}?',
  },
  formatting: {
    listSeparator: ', ',
    conjunction: 'eller',
  },
};
