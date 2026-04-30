import type { LanguageConfig } from '@reaatech/confidence-router-core';

export const greekConfig: LanguageConfig = {
  code: 'el',
  name: 'Greek',
  nativeName: 'Ελληνικά',
  direction: 'ltr',
  clarificationTemplates: {
    basic: 'Μήπως εννοούσατε: {options};',
  },
  formatting: {
    listSeparator: ', ',
    conjunction: 'ή',
  },
};
