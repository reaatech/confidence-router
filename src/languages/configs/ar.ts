import type { LanguageConfig } from '../../types/index.js';

export const arabicConfig: LanguageConfig = {
  code: 'ar',
  name: 'Arabic',
  nativeName: 'العربية',
  direction: 'rtl',
  clarificationTemplates: {
    basic: 'هل تقصد: {options}؟',
  },
  formatting: {
    listSeparator: '، ',
    conjunction: 'أو',
  },
};
