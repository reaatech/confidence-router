import type { LanguageConfig } from '@reaatech/confidence-router-core';

export const hindiConfig: LanguageConfig = {
  code: 'hi',
  name: 'Hindi',
  nativeName: 'हिन्दी',
  direction: 'ltr',
  clarificationTemplates: {
    basic: 'क्या आपका मतलब {options} था?',
  },
  formatting: {
    listSeparator: ', ',
    conjunction: 'या',
  },
};
