import type { LanguageConfig } from '../../types/index.js';

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
