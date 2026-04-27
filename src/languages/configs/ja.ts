import type { LanguageConfig } from '../../types/index.js';

export const japaneseConfig: LanguageConfig = {
  code: 'ja',
  name: 'Japanese',
  nativeName: '日本語',
  direction: 'ltr',
  clarificationTemplates: {
    basic: '{options}のことですか？',
  },
  formatting: {
    listSeparator: '、',
    conjunction: 'または',
  },
};
