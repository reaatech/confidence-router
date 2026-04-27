import type { LanguageConfig } from '../../types/index.js';

export const malayalamConfig: LanguageConfig = {
  code: 'ml',
  name: 'Malayalam',
  nativeName: 'മലയാളം',
  direction: 'ltr',
  clarificationTemplates: {
    basic: 'അര്‍ത്ഥമാക്കുന്നത്: {options}?',
  },
  formatting: {
    listSeparator: ', ',
    conjunction: 'അല്ലെങ്കിൽ',
  },
};
