import type { LanguageConfig } from '../../types/index.js';

export const kannadaConfig: LanguageConfig = {
  code: 'kn',
  name: 'Kannada',
  nativeName: 'ಕನ್ನಡ',
  direction: 'ltr',
  clarificationTemplates: {
    basic: 'ನೀವು ಹೇಳಲು ಬಯಸಿದ್ದು: {options}?',
  },
  formatting: {
    listSeparator: ', ',
    conjunction: 'ಅಥವಾ',
  },
};
