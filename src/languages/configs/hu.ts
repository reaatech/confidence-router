import type { LanguageConfig } from '../../types/index.js';

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
