import type { LanguageConfig } from '../../types/index.js';

export const portugueseConfig: LanguageConfig = {
  code: 'pt',
  name: 'Portuguese',
  nativeName: 'Português',
  direction: 'ltr',
  clarificationTemplates: {
    basic: 'Quis dizer: {options}?',
  },
  formatting: {
    listSeparator: ', ',
    conjunction: 'ou',
  },
};
