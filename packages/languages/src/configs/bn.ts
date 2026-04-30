import type { LanguageConfig } from '@reaatech/confidence-router-core';

export const bengaliConfig: LanguageConfig = {
  code: 'bn',
  name: 'Bengali',
  nativeName: 'বাংলা',
  direction: 'ltr',
  clarificationTemplates: {
    basic: 'আপনি কি বোঝাতে চেয়েছেন: {options}?',
  },
  formatting: {
    listSeparator: ', ',
    conjunction: 'অথবা',
  },
};
