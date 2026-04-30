import type { LanguageConfig } from '@reaatech/confidence-router-core';

export const chineseTraditionalConfig: LanguageConfig = {
  code: 'zh-TW',
  name: 'Chinese (Traditional)',
  nativeName: '繁體中文',
  direction: 'ltr',
  clarificationTemplates: {
    basic: '您是指：{options}？',
  },
  formatting: {
    listSeparator: '、',
    conjunction: '還是',
  },
};
