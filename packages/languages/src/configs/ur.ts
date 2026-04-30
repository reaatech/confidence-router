import type { LanguageConfig } from '@reaatech/confidence-router-core';

export const urduConfig: LanguageConfig = {
  code: 'ur',
  name: 'Urdu',
  nativeName: 'اردو',
  direction: 'rtl',
  clarificationTemplates: {
    basic: 'کیا آپ کا مطلب یہ تھا: {options}?',
  },
  formatting: {
    listSeparator: '، ',
    conjunction: 'یا',
  },
};
