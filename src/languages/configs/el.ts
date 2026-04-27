import type { LanguageConfig } from '../../types/index.js';

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
