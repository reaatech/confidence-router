# Multi-Language Agent

## Purpose
Implement internationalization support in `@reaatech/confidence-router-languages`, including 47 built-in locale configurations, a language manager with English fallback, and a template-based clarification prompt generator.

## Capabilities

### Language System Implementation
- Implement ISO 639-1 language code support across 47 locales
- Create `LanguageManager` class with registry, lookup, and add/remove
- Implement automatic English fallback for unknown codes
- Support both LTR and RTL writing directions

### Clarification Prompt Generation
- Implement `PromptGenerator` class with template interpolation
- Format prediction options using locale-specific separators and conjunctions
- Support custom `{options}` templates
- Handle 2-item (conjunction) vs 3+ item (list + conjunction) formatting

### Locale Configuration
- Define `LanguageConfig` interface in `@reaatech/confidence-router-core`
- Each locale: code, name, nativeName, direction, clarificationTemplates, formatting
- 47 static config files in `packages/languages/src/configs/`

## Triggers
- Internationalization requirements
- Adding a new language
- Prompt template changes
- Locale formatting updates

## Dependencies
- Core Engine Agent (package: `@reaatech/confidence-router-core` for `LanguageConfig`, `Prediction`, `RouterError`)
- Project Setup Agent (for package scaffolding)

## Package Structure

```
packages/languages/
├── src/
│   ├── LanguageManager.ts    # 47-locale registry with English fallback
│   ├── PromptGenerator.ts    # Template interpolation with locale formatting
│   ├── configs/              # 47 static LanguageConfig files
│   │   ├── en.ts, es.ts, fr.ts, de.ts, ...
│   │   └── zh-cn.ts, zh-tw.ts, ja.ts, ko.ts, ...
│   └── index.ts              # Barrel export
├── tests/                    # LanguageManager + PromptGenerator tests
├── package.json              # @reaatech/confidence-router-languages
│                             #   depends on: @reaatech/confidence-router-core
├── tsconfig.json
├── tsup.config.ts
└── vitest.config.ts
```

## Supported Languages (47)

| Region | Languages |
|--------|-----------|
| **Major (12)** | English, Spanish, French, German, Italian, Portuguese, Dutch, Russian, Japanese, Korean, Chinese (Simplified & Traditional), Arabic |
| **European (15)** | Polish, Swedish, Norwegian, Danish, Finnish, Czech, Slovak, Hungarian, Romanian, Bulgarian, Croatian, Serbian, Slovenian, Greek, Turkish |
| **Asian (13)** | Hindi, Bengali, Tamil, Telugu, Marathi, Gujarati, Kannada, Malayalam, Thai, Vietnamese, Indonesian, Malay, Filipino |
| **RTL (4)** | Arabic, Hebrew, Persian, Urdu |
| **Other (3)** | Swahili, Afrikaans |

All 47 locales are loaded at `LanguageManager` construction time from static TypeScript configs.

## Examples

### LanguageManager
```typescript
import { LanguageManager } from '@reaatech/confidence-router-languages';

const lm = new LanguageManager();
lm.getLanguage('es').name;           // 'Spanish'
lm.getLanguage('ja').direction;      // 'ltr'
lm.getLanguage('ar').direction;      // 'rtl'
lm.getLanguage('xx').name;           // 'English' (fallback)
lm.hasLanguage('fr');                // true
lm.getSupportedLanguages().length;   // 47
```

### PromptGenerator
```typescript
import { PromptGenerator, LanguageManager } from '@reaatech/confidence-router-languages';

const pg = new PromptGenerator(new LanguageManager());

const prompt = pg.generate(
  [
    { confidence: 0.55, label: 'book_flight' },
    { confidence: 0.45, label: 'check_status' },
  ],
  'es'
);
// → "¿Quisiste decir: book_flight o check_status?"
```

### Adding a Custom Language
```typescript
import type { LanguageConfig } from '@reaatech/confidence-router-core';
import { LanguageManager } from '@reaatech/confidence-router-languages';

const lm = new LanguageManager();
lm.addLanguage({
  code: 'eo',
  name: 'Esperanto',
  nativeName: 'Esperanto',
  direction: 'ltr',
  clarificationTemplates: { basic: 'Ĉu vi celis: {options}?' },
  formatting: { listSeparator: ', ', conjunction: 'aŭ' },
});
```

### Multiple Language Loop
```typescript
for (const code of ['en', 'es', 'ja', 'ar']) {
  console.log(pg.generate(predictions, code));
}
// en: "Did you mean: book or status?"
// es: "¿Quisiste decir: book o status?"
// ja: "どちらをお探しですか：book、status"
// ar: "هل كنت تقصد: book أو status؟"
```

## Quality Standards

### Locale Quality
- 47 built-in locales, each with native speaker-verified templates
- Consistent template format: `{options}` placeholder
- Locale-aware list separators and conjunctions

### Code Quality
- 100% TypeScript strict mode
- English fallback ensures no crash on unknown codes
- `RouterError.LANGUAGE_NOT_SUPPORTED` when default locale is missing

### Performance
- All 47 configs loaded at constructor time (static imports)
- Prompt generation < 1ms
- Memory: ~5KB for all locale configs combined

## Integrating with ConfidenceRouter

The barrel package wires `LanguageManager` and `PromptGenerator` by default:

```typescript
// In @reaatech/confidence-router/src/ConfidenceRouter.ts
import { LanguageManager, PromptGenerator } from '@reaatech/confidence-router-languages';

const lm = new LanguageManager();
const pg = new PromptGenerator(lm);

// Used internally for clarification:
const prompt = pg.generate(classification.predictions, 'en');
```

Custom implementations can be injected via `ConfidenceRouterDeps`:

```typescript
const router = new ConfidenceRouter(undefined, {
  languageManager: new CustomLanguageManager(),
  promptGenerator: new CustomPromptGenerator(lm),
});
```

## Integration Points

- **core**: Depends on `LanguageConfig`, `Prediction`, `RouterError`
- **confidence-router**: Uses `LanguageManager` + `PromptGenerator` via barrel package

---

**Agent Version**: 2.0.0
**Last Updated**: 2026-04-30
**Status**: Active
