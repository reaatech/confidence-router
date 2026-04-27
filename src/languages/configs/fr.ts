import type { LanguageConfig } from '../../types/index.js';

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
