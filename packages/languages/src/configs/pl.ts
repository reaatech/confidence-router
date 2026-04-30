import type { LanguageConfig } from '@reaatech/confidence-router-core';

export const polishConfig: LanguageConfig = {
  code: 'pl',
  name: 'Polish',
  nativeName: 'Polski',
  direction: 'ltr',
  clarificationTemplates: {
    basic: 'Czy chodziło Ci o: {options}?',
  },
  formatting: {
    listSeparator: ', ',
    conjunction: 'lub',
  },
};
