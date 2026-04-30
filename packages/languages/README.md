# @reaatech/confidence-router-languages

[![npm version](https://img.shields.io/npm/v/@reaatech/confidence-router-languages.svg)](https://www.npmjs.com/package/@reaatech/confidence-router-languages)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/reaatech/confidence-router/blob/main/LICENSE)
[![CI](https://img.shields.io/github/actions/workflow/status/reaatech/confidence-router/ci.yml?branch=main&label=CI)](https://github.com/reaatech/confidence-router/actions/workflows/ci.yml)

> **Status:** Pre-1.0 — APIs may change in minor versions. Pin to a specific version in production.

Multi-language support for confidence-router clarification prompts, with **47 built-in locale configurations** and a pluggable `LanguageConfig` system. Manages language metadata, prompt templates, and locale-aware formatting conventions.

## Installation

```bash
npm install @reaatech/confidence-router-languages
# or
pnpm add @reaatech/confidence-router-languages
```

## Feature Overview

- **47 built-in languages** — Afrikaans to Zulu, covering all major languages
- **Localized clarification templates** — each language has prompt strings with `{options}` placeholder
- **Locale-aware formatting** — list separators (`", "` vs `"、"`) and conjunctions (`"or"` vs `"还是"`)
- **RTL support** — `direction: "rtl"` for Arabic, Hebrew, Persian, Urdu
- **English fallback** — unknown language codes silently fall back to English
- **Custom languages** — `addLanguage()` for adding new locale configs at runtime
- **Zero external dependencies** beyond `@reaatech/confidence-router-core`

## Quick Start

```typescript
import { LanguageManager, PromptGenerator } from "@reaatech/confidence-router-languages";

const languages = new LanguageManager();
const prompt = new PromptGenerator(languages);

const text = prompt.generate(
  [
    { confidence: 0.55, label: "book_flight" },
    { confidence: 0.45, label: "check_status" },
  ],
  "es" // Spanish
);
// → "¿Quisiste decir: book_flight o check_status?"
```

## Built-in Languages

| Code | Language | Direction |
|------|----------|-----------|
| `en` | English | ltr |
| `es` | Spanish | ltr |
| `fr` | French | ltr |
| `de` | German | ltr |
| `it` | Italian | ltr |
| `pt` | Portuguese | ltr |
| `nl` | Dutch | ltr |
| `ru` | Russian | ltr |
| `ja` | Japanese | ltr |
| `ko` | Korean | ltr |
| `zh-cn` | Chinese (Simplified) | ltr |
| `zh-tw` | Chinese (Traditional) | ltr |
| `ar` | Arabic | rtl |
| `he` | Hebrew | rtl |
| `fa` | Persian | rtl |
| `ur` | Urdu | rtl |
| `hi` | Hindi | ltr |
| `bn` | Bengali | ltr |
| `ta` | Tamil | ltr |
| `te` | Telugu | ltr |
| `mr` | Marathi | ltr |
| `gu` | Gujarati | ltr |
| `kn` | Kannada | ltr |
| `ml` | Malayalam | ltr |
| `tr` | Turkish | ltr |
| `pl` | Polish | ltr |
| `sv` | Swedish | ltr |
| `no` | Norwegian | ltr |
| `da` | Danish | ltr |
| `fi` | Finnish | ltr |
| `cs` | Czech | ltr |
| `el` | Greek | ltr |
| `th` | Thai | ltr |
| `vi` | Vietnamese | ltr |
| `id` | Indonesian | ltr |
| `ms` | Malay | ltr |
| `fil` | Filipino | ltr |
| `ro` | Romanian | ltr |
| `bg` | Bulgarian | ltr |
| `hr` | Croatian | ltr |
| `sr` | Serbian | ltr |
| `sl` | Slovenian | ltr |
| `hu` | Hungarian | ltr |
| `sk` | Slovak | ltr |
| `uk` | Ukrainian | ltr |
| `sw` | Swahili | ltr |
| `af` | Afrikaans | ltr |

## API Reference

### LanguageManager

```typescript
import { LanguageManager } from "@reaatech/confidence-router-languages";

const lm = new LanguageManager();
```

| Method | Returns | Description |
|--------|---------|-------------|
| `getLanguage(code)` | `LanguageConfig` | Retrieves config by ISO 639-1 code; falls back to English |
| `addLanguage(config)` | `void` | Registers a custom language configuration |
| `hasLanguage(code)` | `boolean` | Checks whether a language is supported |
| `getSupportedLanguages()` | `string[]` | Returns all registered language codes |

### PromptGenerator

```typescript
import { PromptGenerator } from "@reaatech/confidence-router-languages";

const pg = new PromptGenerator(languageManager);
```

| Method | Returns | Description |
|--------|---------|-------------|
| `generate(predictions, languageCode, customTemplate?, maxOptions?)` | `string` | Formats a clarification prompt with sorted prediction labels |

The `generate` method:
1. Looks up the language config
2. Sorts predictions by confidence descending
3. Truncates to `maxOptions` (default: 3)
4. Formats labels using locale-specific separators and conjunctions
5. Replaces `{options}` in the template with the formatted list

### Prompt Templating

Custom templates use the `{options}` placeholder:

```typescript
const template = "Which of these did you mean: {options}";
const text = pg.generate(predictions, "en", template);
// → "Which of these did you mean: book_flight, check_status, or cancel_booking"
```

### Adding a Custom Language

```typescript
import type { LanguageConfig } from "@reaatech/confidence-router-core";
import { LanguageManager } from "@reaatech/confidence-router-languages";

const lm = new LanguageManager();
lm.addLanguage({
  code: "eo",
  name: "Esperanto",
  nativeName: "Esperanto",
  direction: "ltr",
  clarificationTemplates: {
    basic: "Ĉu vi celis: {options}?",
  },
  formatting: {
    listSeparator: ", ",
    conjunction: "aŭ",
  },
});
```

## Usage Patterns

### Multi-language Clarification

```typescript
const languages = new LanguageManager();
const prompt = new PromptGenerator(languages);

for (const code of ["en", "es", "ja", "ar"]) {
  console.log(prompt.generate([
    { confidence: 0.55, label: "book" },
    { confidence: 0.45, label: "status" },
  ], code));
}

// en: "Did you mean: book or status?"
// es: "¿Quisiste decir: book o status?"
// ja: "どちらをお探しですか：book、status"
// ar: "هل كنت تقصد: book أو status؟"
```

## Related Packages

- [`@reaatech/confidence-router-core`](https://www.npmjs.com/package/@reaatech/confidence-router-core) — Core types including `LanguageConfig` and `Prediction`
- [`@reaatech/confidence-router`](https://www.npmjs.com/package/@reaatech/confidence-router) — Full router with language-aware clarification

## License

[MIT](https://github.com/reaatech/confidence-router/blob/main/LICENSE)
