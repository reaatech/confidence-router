import type { LanguageConfig } from '../../types/index.js';

export const thaiConfig: LanguageConfig = {
  code: 'th',
  name: 'Thai',
  nativeName: 'ไทย',
  direction: 'ltr',
  clarificationTemplates: {
    basic: 'คุณหมายถึง: {options} หรือไม่?',
  },
  formatting: {
    listSeparator: ', ',
    conjunction: 'หรือ',
  },
};
