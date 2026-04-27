import type { LanguageConfig } from '../../types/index.js';

export const swahiliConfig: LanguageConfig = {
  code: 'sw',
  name: 'Swahili',
  nativeName: 'Kiswahili',
  direction: 'ltr',
  clarificationTemplates: {
    basic: 'Je, ulikuwa unamaanisha: {options}?',
  },
  formatting: {
    listSeparator: ', ',
    conjunction: 'au',
  },
};
