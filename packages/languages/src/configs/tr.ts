import type { LanguageConfig } from '@reaatech/confidence-router-core';

export const turkishConfig: LanguageConfig = {
  code: 'tr',
  name: 'Turkish',
  nativeName: 'Türkçe',
  direction: 'ltr',
  clarificationTemplates: {
    basic: '{options} mi demiştiniz?',
  },
  formatting: {
    listSeparator: ', ',
    conjunction: 'veya',
  },
};
