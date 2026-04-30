import type { LanguageConfig } from '@reaatech/confidence-router-core';

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
