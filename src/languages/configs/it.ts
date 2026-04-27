import type { LanguageConfig } from '../../types/index.js';

export const italianConfig: LanguageConfig = {
  code: 'it',
  name: 'Italian',
  nativeName: 'Italiano',
  direction: 'ltr',
  clarificationTemplates: {
    basic: 'Intendevi: {options}?',
  },
  formatting: {
    listSeparator: ', ',
    conjunction: 'o',
  },
};
