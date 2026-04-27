import type { LanguageConfig } from '../../types/index.js';

export const czechConfig: LanguageConfig = {
  code: 'cs',
  name: 'Czech',
  nativeName: 'Čeština',
  direction: 'ltr',
  clarificationTemplates: {
    basic: 'Měli jste na mysli: {options}?',
  },
  formatting: {
    listSeparator: ', ',
    conjunction: 'nebo',
  },
};
