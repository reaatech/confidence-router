import type { LanguageConfig } from '@reaatech/confidence-router-core';

export const malayConfig: LanguageConfig = {
  code: 'ms',
  name: 'Malay',
  nativeName: 'Bahasa Melayu',
  direction: 'ltr',
  clarificationTemplates: {
    basic: 'Adakah maksud anda: {options}?',
  },
  formatting: {
    listSeparator: ', ',
    conjunction: 'atau',
  },
};
