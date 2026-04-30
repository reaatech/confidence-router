import type { LanguageConfig } from '@reaatech/confidence-router-core';

export const tamilConfig: LanguageConfig = {
  code: 'ta',
  name: 'Tamil',
  nativeName: 'தமிழ்',
  direction: 'ltr',
  clarificationTemplates: {
    basic: 'நீங்கள் குறிப்பிடுவது: {options}?',
  },
  formatting: {
    listSeparator: ', ',
    conjunction: 'அல்லது',
  },
};
