import type { LanguageConfig } from '../../types/index.js';

export const marathiConfig: LanguageConfig = {
  code: 'mr',
  name: 'Marathi',
  nativeName: 'मराठी',
  direction: 'ltr',
  clarificationTemplates: {
    basic: 'तुम्हाला म्हणायचे आहे: {options}?',
  },
  formatting: {
    listSeparator: ', ',
    conjunction: 'किंवा',
  },
};
