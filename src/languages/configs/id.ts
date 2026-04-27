import type { LanguageConfig } from '../../types/index.js';

export const indonesianConfig: LanguageConfig = {
  code: 'id',
  name: 'Indonesian',
  nativeName: 'Bahasa Indonesia',
  direction: 'ltr',
  clarificationTemplates: {
    basic: 'Apakah maksud Anda: {options}?',
  },
  formatting: {
    listSeparator: ', ',
    conjunction: 'atau',
  },
};
