import { describe, expect, it } from 'vitest';
import { LanguageManager } from '../src/LanguageManager.js';

describe('LanguageManager', () => {
  const manager = new LanguageManager();

  it('should return English config for English', () => {
    const config = manager.getLanguage('en');
    expect(config.code).toBe('en');
    expect(config.name).toBe('English');
  });

  it('should return Spanish config for Spanish', () => {
    const config = manager.getLanguage('es');
    expect(config.code).toBe('es');
    expect(config.name).toBe('Spanish');
  });

  it('should fallback to English for unknown language', () => {
    const config = manager.getLanguage('xx');
    expect(config.code).toBe('en');
  });

  it('should support 47 languages', () => {
    const freshManager = new LanguageManager();
    const languages = freshManager.getSupportedLanguages();
    expect(languages.length).toBe(47);
  });

  it('should have Arabic as RTL', () => {
    const config = manager.getLanguage('ar');
    expect(config.direction).toBe('rtl');
  });

  it('should have Hebrew as RTL', () => {
    const config = manager.getLanguage('he');
    expect(config.direction).toBe('rtl');
  });

  it('should have Persian as RTL', () => {
    const config = manager.getLanguage('fa');
    expect(config.direction).toBe('rtl');
  });

  it('should have Urdu as RTL', () => {
    const config = manager.getLanguage('ur');
    expect(config.direction).toBe('rtl');
  });

  it('should allow adding custom languages', () => {
    manager.addLanguage({
      code: 'custom',
      name: 'Custom Language',
      nativeName: 'Custom',
      direction: 'ltr',
      clarificationTemplates: {
        basic: 'Custom: {options}?',
      },
      formatting: {
        listSeparator: ', ',
      },
    });

    expect(manager.hasLanguage('custom')).toBe(true);
    expect(manager.getLanguage('custom').name).toBe('Custom Language');
  });
});
