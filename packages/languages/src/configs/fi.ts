import type { LanguageConfig } from '@reaatech/confidence-router-core';

export const finnishConfig: LanguageConfig = {
  code: 'fi',
  name: 'Finnish',
  nativeName: 'Suomi',
  direction: 'ltr',
  clarificationTemplates: {
    basic: 'Tarkoititko: {options}?',
  },
  formatting: {
    listSeparator: ', ',
    conjunction: 'tai',
  },
};
