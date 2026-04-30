import type { LanguageConfig } from '@reaatech/confidence-router-core';

export const frenchConfig: LanguageConfig = {
  code: 'fr',
  name: 'French',
  nativeName: 'Français',
  direction: 'ltr',
  clarificationTemplates: {
    basic: 'Vouliez-vous dire : {options} ?',
  },
  formatting: {
    listSeparator: ', ',
    conjunction: 'ou',
  },
};
