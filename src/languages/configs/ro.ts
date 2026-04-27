import type { LanguageConfig } from '../../types/index.js';

export const romanianConfig: LanguageConfig = {
  code: 'ro',
  name: 'Romanian',
  nativeName: 'Română',
  direction: 'ltr',
  clarificationTemplates: {
    basic: 'Vrei să spui: {options}?',
  },
  formatting: {
    listSeparator: ', ',
    conjunction: 'sau',
  },
};
