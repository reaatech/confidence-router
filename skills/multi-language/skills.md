# Multi-Language Agent

## Purpose
Implement comprehensive internationalization support with 45+ languages, dynamic clarification prompt generation, and cultural adaptation for global deployment of the confidence-router system.

## Capabilities

### Language System Implementation
- Implement ISO 639-1 language code support
- Create language configuration and management system
- Implement language detection utilities
- Build language fallback mechanisms

### Clarification Prompt Generation
- Design prompt template system
- Implement dynamic prompt generation based on classification results
- Support custom prompt templates
- Create prompt localization system

### Translation Management
- Manage translation files for 45+ languages
- Implement translation validation
- Create translation update workflows
- Support community-contributed translations

### Cultural Adaptation
- Implement cultural formatting rules
- Support locale-specific number formatting
- Handle cultural context in prompts
- Implement polite form handling

## Triggers
- Internationalization requirements
- Prompt generation needs
- Translation updates
- Cultural adaptation requirements

## Dependencies
- Core Engine Agent (for decision integration)
- Project Setup Agent (for project structure)

## Configuration

### Language Configuration
```typescript
interface LanguageConfig {
  code: string; // ISO 639-1
  name: string;
  nativeName: string;
  direction: 'ltr' | 'rtl';
  
  clarificationTemplates: {
    basic: string;
    detailed: string;
    options: string;
  };
  
  formatting: {
    listSeparator: string;
    questionEnding: string;
    politeForm: boolean;
    numberFormat: NumberFormat;
  };
}
```

### Prompt Templates
```typescript
interface PromptTemplates {
  clarification: {
    basic: string;      // "Did you mean: {options}?"
    detailed: string;   // "I'm not entirely sure. Could you clarify: {options}?"
    options: string;    // "{option1} or {option2}"
  };
  confirmation: {
    selected: string;   // "I'll help you with {selection}"
    action: string;     // "Processing your request for {action}"
  };
}
```

## Supported Languages (45+)

### Major Languages (Priority 1)
- English (en)
- Spanish (es)
- French (fr)
- German (de)
- Italian (it)
- Portuguese (pt)
- Dutch (nl)
- Russian (ru)
- Japanese (ja)
- Korean (ko)
- Chinese Simplified (zh-CN)
- Chinese Traditional (zh-TW)
- Arabic (ar)

### European Languages (Priority 2)
- Polish (pl)
- Swedish (sv)
- Norwegian (no)
- Danish (da)
- Finnish (fi)
- Czech (cs)
- Slovak (sk)
- Hungarian (hu)
- Romanian (ro)
- Bulgarian (bg)
- Croatian (hr)
- Serbian (sr)
- Slovenian (sl)
- Greek (el)
- Turkish (tr)

### Asian Languages (Priority 3)
- Hindi (hi)
- Bengali (bn)
- Tamil (ta)
- Telugu (te)
- Marathi (mr)
- Gujarati (gu)
- Kannada (kn)
- Malayalam (ml)
- Thai (th)
- Vietnamese (vi)
- Indonesian (id)
- Malay (ms)
- Filipino (fil)

### Other Languages (Priority 4)
- Hebrew (he)
- Persian (fa)
- Urdu (ur)
- Swahili (sw)
- Afrikaans (af)

## Examples

### Language Configuration
```typescript
// src/languages/configurations/en.ts
export const EnglishConfig: LanguageConfig = {
  code: 'en',
  name: 'English',
  nativeName: 'English',
  direction: 'ltr',
  
  clarificationTemplates: {
    basic: 'Did you mean: {options}?',
    detailed: "I'm not entirely sure. Could you clarify if you meant: {options}?",
    options: '{option1} or {option2}'
  },
  
  formatting: {
    listSeparator: ', ',
    questionEnding: '?',
    politeForm: false,
    numberFormat: {
      decimal: '.',
      thousands: ',',
      currency: 'USD'
    }
  }
};
```

### Prompt Generation
```typescript
class PromptGenerator {
  constructor(private languageConfig: LanguageConfig) {}
  
  generateClarificationPrompt(
    predictions: Prediction[],
    context?: Record<string, unknown>
  ): string {
    const topPredictions = predictions.slice(0, 3);
    const options = this.formatOptions(topPredictions);
    
    return this.languageConfig.clarificationTemplates.basic
      .replace('{options}', options);
  }
  
  private formatOptions(predictions: Prediction[]): string {
    const { listSeparator } = this.languageConfig.formatting;
    const labels = predictions.map(p => p.label);
    
    if (labels.length === 2) {
      return labels.join(' or ');
    }
    
    return labels.slice(0, -1).join(listSeparator) + 
           ', or ' + labels[labels.length - 1];
  }
}
```

### Language Detection
```typescript
class LanguageDetector {
  detect(userInput: string, preferences?: string[]): string {
    // Detect from user input patterns
    const detected = this.detectFromInput(userInput);
    
    // Fall back to preferences
    if (!detected && preferences?.length) {
      return preferences[0];
    }
    
    // Default to English
    return detected || 'en';
  }
  
  private detectFromInput(input: string): string | null {
    // Simple detection based on character sets
    if (/[\u4e00-\u9fff]/.test(input)) return 'zh';
    if (/[\u0600-\u06ff]/.test(input)) return 'ar';
    if (/[\u3040-\u309f\u30a0-\u30ff]/.test(input)) return 'ja';
    
    return null;
  }
}
```

## Output Artifacts

### Language Manager
```typescript
// src/languages/LanguageManager.ts
export class LanguageManager {
  private languages: Map<string, LanguageConfig> = new Map();
  private defaultLanguage: string = 'en';
  
  constructor() {
    this.loadBuiltInLanguages();
  }
  
  getLanguage(code: string): LanguageConfig {
    return this.languages.get(code) || 
           this.languages.get(this.defaultLanguage)!;
  }
  
  addLanguage(config: LanguageConfig): void {
    this.languages.set(config.code, config);
  }
  
  private loadBuiltInLanguages(): void {
    // Load all 45+ language configurations
    this.addLanguage(EnglishConfig);
    this.addLanguage(SpanishConfig);
    // ... more languages
  }
}
```

### Translation Files
```json
// src/languages/translations/es.json
{
  "clarification": {
    "basic": "¿Quisiste decir: {options}?",
    "detailed": "No estoy completamente seguro. ¿Podrías aclarar si quisiste decir: {options}?",
    "options": "{option1} o {option2}"
  },
  "confirmation": {
    "selected": "Te ayudaré con {selection}",
    "action": "Procesando tu solicitud para {action}"
  },
  "errors": {
    "unknown": "Ocurrió un error desconocido",
    "timeout": "La solicitud tardó demasiado"
  }
}
```

### Prompt Factory
```typescript
// src/languages/PromptFactory.ts
export class PromptFactory {
  constructor(private languageManager: LanguageManager) {}
  
  createClarificationPrompt(
    predictions: Prediction[],
    languageCode?: string
  ): string {
    const language = this.languageManager.getLanguage(languageCode || 'en');
    const generator = new PromptGenerator(language);
    
    return generator.generateClarificationPrompt(predictions);
  }
  
  createCustomPrompt(
    template: string,
    variables: Record<string, any>,
    languageCode?: string
  ): string {
    const language = this.languageManager.getLanguage(languageCode || 'en');
    
    return this.interpolate(template, variables, language);
  }
}
```

## Quality Standards

### Translation Quality
- Native speaker verification
- Cultural context validation
- Consistent terminology
- Regular quality audits

### Code Quality
- 100% TypeScript strict mode
- Comprehensive error handling
- Extensive language testing
- Performance optimization

### Performance
- Language loading < 100ms
- Prompt generation < 10ms
- Memory efficient language storage
- Lazy loading support

## Error Handling

### Language Errors
```typescript
enum LanguageError {
  LANGUAGE_NOT_SUPPORTED = 'LANGUAGE_NOT_SUPPORTED',
  TRANSLATION_MISSING = 'TRANSLATION_MISSING',
  INVALID_LANGUAGE_CODE = 'INVALID_LANGUAGE_CODE',
  TEMPLATE_ERROR = 'TEMPLATE_ERROR'
}
```

### Fallback Strategies
- Default to English on errors
- Use template variables as fallback
- Log missing translations
- Provide translation suggestions

## Cultural Considerations

### Formatting Rules
- Number formatting by locale
- Date and time formatting
- Currency formatting
- Text direction (LTR/RTL)

### Politeness Levels
- Formal vs informal address
- Honorifics where appropriate
- Cultural sensitivity in prompts
- Context-aware formality

## Integration Points

### With Other Agents
- **Core Engine Agent**: Provides clarification prompts
- **Documentation Agent**: Creates language documentation
- **Testing Agent**: Implements language testing
- **Classifier Agent**: Handles language-specific classification

### External Systems
- Translation management systems
- Localization platforms
- Cultural consultation services
- Community translation tools

## Maintenance

### Translation Updates
- Regular translation reviews
- Community contribution management
- Quality assurance processes
- Version control for translations

### Language Additions
- New language onboarding
- Cultural consultation
- Native speaker recruitment
- Quality validation processes

## Support

### Documentation
- Language configuration guides
- Translation contribution guides
- Cultural adaptation guidelines
- Troubleshooting for language issues

### Community
- Translation contribution program
- Cultural consultation network
- Language-specific support channels
- Community translation reviews

---

**Agent Version**: 1.0.0  
**Last Updated**: 2026-04-22  
**Status**: Active
