import type { LanguageConfig } from '../../types/index.js';

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
