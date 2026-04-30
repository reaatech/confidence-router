import type { LanguageConfig } from '@reaatech/confidence-router-core';

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
