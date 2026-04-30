import type { LanguageConfig } from '@reaatech/confidence-router-core';

export const bulgarianConfig: LanguageConfig = {
  code: 'bg',
  name: 'Bulgarian',
  nativeName: 'Български',
  direction: 'ltr',
  clarificationTemplates: {
    basic: 'Имахте предвид: {options}?',
  },
  formatting: {
    listSeparator: ', ',
    conjunction: 'или',
  },
};
