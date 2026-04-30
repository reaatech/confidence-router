import type { LanguageConfig } from '@reaatech/confidence-router-core';

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
