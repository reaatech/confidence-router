import type { LanguageConfig } from '@reaatech/confidence-router-core';

export const russianConfig: LanguageConfig = {
  code: 'ru',
  name: 'Russian',
  nativeName: 'Русский',
  direction: 'ltr',
  clarificationTemplates: {
    basic: 'Вы имели в виду: {options}?',
  },
  formatting: {
    listSeparator: ', ',
    conjunction: 'или',
  },
};
