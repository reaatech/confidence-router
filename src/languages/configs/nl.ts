import type { LanguageConfig } from '../../types/index.js';

export const dutchConfig: LanguageConfig = {
  code: 'nl',
  name: 'Dutch',
  nativeName: 'Nederlands',
  direction: 'ltr',
  clarificationTemplates: {
    basic: 'Bedoelde u: {options}?',
  },
  formatting: {
    listSeparator: ', ',
    conjunction: 'of',
  },
};
