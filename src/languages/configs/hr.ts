import type { LanguageConfig } from '../../types/index.js';

export const croatianConfig: LanguageConfig = {
  code: 'hr',
  name: 'Croatian',
  nativeName: 'Hrvatski',
  direction: 'ltr',
  clarificationTemplates: {
    basic: 'Jeste li mislili: {options}?',
  },
  formatting: {
    listSeparator: ', ',
    conjunction: 'ili',
  },
};
