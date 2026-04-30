import type { LanguageConfig } from '@reaatech/confidence-router-core';

export const persianConfig: LanguageConfig = {
  code: 'fa',
  name: 'Persian',
  nativeName: 'فارسی',
  direction: 'rtl',
  clarificationTemplates: {
    basic: 'منظورتان این بود: {options}?',
  },
  formatting: {
    listSeparator: '، ',
    conjunction: 'یا',
  },
};
