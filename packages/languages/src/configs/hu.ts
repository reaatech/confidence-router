import type { LanguageConfig } from '@reaatech/confidence-router-core';

export const hungarianConfig: LanguageConfig = {
  code: 'hu',
  name: 'Hungarian',
  nativeName: 'Magyar',
  direction: 'ltr',
  clarificationTemplates: {
    basic: 'Erre gondolt: {options}?',
  },
  formatting: {
    listSeparator: ', ',
    conjunction: 'vagy',
  },
};
