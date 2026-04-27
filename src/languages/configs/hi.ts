import type { LanguageConfig } from '../../types/index.js';

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
