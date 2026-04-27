import type { LanguageConfig } from '../../types/index.js';

export const afrikaansConfig: LanguageConfig = {
  code: 'af',
  name: 'Afrikaans',
  nativeName: 'Afrikaans',
  direction: 'ltr',
  clarificationTemplates: {
    basic: 'Het jy bedoel: {options}?',
  },
  formatting: {
    listSeparator: ', ',
    conjunction: 'of',
  },
};
