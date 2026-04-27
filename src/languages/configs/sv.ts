import type { LanguageConfig } from '../../types/index.js';

export const swedishConfig: LanguageConfig = {
  code: 'sv',
  name: 'Swedish',
  nativeName: 'Svenska',
  direction: 'ltr',
  clarificationTemplates: {
    basic: 'Menade du: {options}?',
  },
  formatting: {
    listSeparator: ', ',
    conjunction: 'eller',
  },
};
