import type { LanguageConfig } from '@reaatech/confidence-router-core';

export const koreanConfig: LanguageConfig = {
  code: 'ko',
  name: 'Korean',
  nativeName: '한국어',
  direction: 'ltr',
  clarificationTemplates: {
    basic: '{options}을(를) 말씀하신 건가요?',
  },
  formatting: {
    listSeparator: ', ',
    conjunction: '또는',
  },
};
