import type { LanguageConfig } from '@reaatech/confidence-router-core';

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
