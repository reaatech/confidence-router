import type { LanguageConfig } from '../../types/index.js';

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
