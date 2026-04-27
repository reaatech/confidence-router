import type { LanguageConfig } from '../../types/index.js';

export const finnishConfig: LanguageConfig = {
  code: 'fi',
  name: 'Finnish',
  nativeName: 'Suomi',
  direction: 'ltr',
  clarificationTemplates: {
    basic: 'Tarkoititko: {options}?',
  },
  formatting: {
    listSeparator: ', ',
    conjunction: 'tai',
  },
};
