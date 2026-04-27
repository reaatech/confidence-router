import type { LanguageConfig } from '../../types/index.js';

export const norwegianConfig: LanguageConfig = {
  code: 'no',
  name: 'Norwegian',
  nativeName: 'Norsk',
  direction: 'ltr',
  clarificationTemplates: {
    basic: 'Mente du: {options}?',
  },
  formatting: {
    listSeparator: ', ',
    conjunction: 'eller',
  },
};
