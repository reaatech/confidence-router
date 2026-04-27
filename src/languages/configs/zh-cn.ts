import type { LanguageConfig } from '../../types/index.js';

export const chineseSimplifiedConfig: LanguageConfig = {
  code: 'zh-CN',
  name: 'Chinese (Simplified)',
  nativeName: '简体中文',
  direction: 'ltr',
  clarificationTemplates: {
    basic: '您是指：{options}？',
  },
  formatting: {
    listSeparator: '、',
    conjunction: '还是',
  },
};
