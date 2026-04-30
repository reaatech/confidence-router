import type { LanguageConfig } from '@reaatech/confidence-router-core';

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
