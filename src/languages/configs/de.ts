import type { LanguageConfig } from '../../types/index.js';

export const germanConfig: LanguageConfig = {
  code: 'de',
  name: 'German',
  nativeName: 'Deutsch',
  direction: 'ltr',
  clarificationTemplates: {
    basic: 'Meinten Sie: {options}?',
  },
  formatting: {
    listSeparator: ', ',
    conjunction: 'oder',
  },
};
