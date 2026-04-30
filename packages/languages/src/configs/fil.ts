import type { LanguageConfig } from '@reaatech/confidence-router-core';

export const filipinoConfig: LanguageConfig = {
  code: 'fil',
  name: 'Filipino',
  nativeName: 'Filipino',
  direction: 'ltr',
  clarificationTemplates: {
    basic: 'Ang ibig mong sabihin ba ay: {options}?',
  },
  formatting: {
    listSeparator: ', ',
    conjunction: 'o',
  },
};
