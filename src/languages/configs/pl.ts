import type { LanguageConfig } from '../../types/index.js';

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
