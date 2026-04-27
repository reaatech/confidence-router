import type { LanguageConfig } from '../../types/index.js';

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
