import type { LanguageConfig } from '@reaatech/confidence-router-core';

export const gujaratiConfig: LanguageConfig = {
  code: 'gu',
  name: 'Gujarati',
  nativeName: 'ગુજરાતી',
  direction: 'ltr',
  clarificationTemplates: {
    basic: 'તમારો અર્થ છે: {options}?',
  },
  formatting: {
    listSeparator: ', ',
    conjunction: 'અથવા',
  },
};
