import type { LanguageConfig } from '@reaatech/confidence-router-core';

export const vietnameseConfig: LanguageConfig = {
  code: 'vi',
  name: 'Vietnamese',
  nativeName: 'Tiếng Việt',
  direction: 'ltr',
  clarificationTemplates: {
    basic: 'Bạn có ý nói: {options} không?',
  },
  formatting: {
    listSeparator: ', ',
    conjunction: 'hoặc',
  },
};
