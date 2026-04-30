import type { LanguageConfig } from '@reaatech/confidence-router-core';

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
