---
title: "Internationalization - Metronic NextJS"
url: "https://docs.keenthemes.com/metronic-nextjs/metronic-nextjs/guides/internationalization"
section: "metronic-nextjs"
---
PurchasePreview

#### Getting Started

IntroductionInstallationStarter KitsPrismaSupabaseComponentsReferencesChangelog - v9.4.4PricingFAQ

#### Guides

Custom AuthAdding New PageLayoutsRoutingProvidersAuthenticationInternationalizationRTLDark ModeHooksDeployment

Getting Started

# Internationalization

Implement and customize multi-language support in Metronic Next.js.

# Internationalization

Metronic Next.js includes built-in internationalization support using i18next and a flexible context provider system. This guide explains how to use and customize the i18n features.

## i18n Architecture

The internationalization system is built around these key components:

- I18nProvider: Client-side provider that manages language state

- RadixDirectionProvider: Handles RTL/LTR text direction

- Translation Files: JSON files containing translations for each language

- Language Selector: UI component for switching languages

- Formatting Utilities: Helper functions for dates, numbers, etc.

## Using Translations

### Basic Translation

To access translations in your components, use the useTranslation hook:

```text
'use client';
 
import { useTranslation } from 'react-i18next';
 
function LoginForm() {
  const { t } = useTranslation();
 
  return (
    <form>
      <h1>{t('auth.login.title')}</h1>
      <button type="submit">{t('auth.login.button')}</button>
    </form>
  );
}
```

### Switching Languages

To change the current language:

```text
'use client';
 
import { useLanguage } from '@/providers/i18n-provider';
import { I18N_LANGUAGES } from '@/i18n/config';
 
function LanguageSelector() {
  const { languageCode, changeLanguage } = useLanguage();
 
  return (
    <select
      value={languageCode}
      onChange={(e) => changeLanguage(e.target.value)}
    >
      {I18N_LANGUAGES.map(lang => (
        <option key={lang.code} value={lang.code}>
          {lang.name}
        </option>
      ))}
    </select>
  );
}
```

### Formatting Dates and Numbers

Use the formatting utilities for consistent localized formatting:

```text
'use client';
 
import { formatDate, formatMoney } from '@/i18n/format';
 
function TransactionItem({ transaction }) {
  return (
    <div>
      <span>{formatDate(transaction.date)}</span>
      <span>{formatMoney(transaction.amount)}</span>
      <span>{transaction.description}</span>
    </div>
  );
}
```

## RTL (Right-to-Left) Support

For RTL languages like Arabic, the direction is automatically adjusted when switching languages. Use the useLanguage hook to check direction:

```text
'use client';
 
import { useLanguage } from '@/providers/i18n-provider';
 
function DirectionAwareComponent() {
  const { language } = useLanguage();
  const isRTL = language.direction === 'rtl';
 
  return (
    <div className={isRTL ? 'rtl-specific-class' : 'ltr-specific-class'}>
      {isRTL ? 'Right-to-left content' : 'Left-to-right content'}
    </div>
  );
}
```

For more details about RTL support, see the RTL Support Guide.

## Adding Translation Content

Create translation files for each language:

```text
// Example: en.json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "error": "Error"
  },
  "auth": {
    "login": {
      "title": "Sign in to your account",
      "button": "Sign in"
    }
  }
}
```

## Namespaces

You can organize translations into namespaces:

```text
// Using a specific namespace
const { t } = useTranslation('dashboard');
const title = t('overview.title');
```

## Advanced Usage

### Translation with Variables

Pass variables to translations:

```text
// Translation: "Hello, {{name}}!"
const greeting = t('greeting', { name: 'John' });
```

### Pluralization

Handle plural forms:

```text
// Translation: "{{count}} item" / "{{count}} items"
const itemCount = t('items', { count: 5 }); // "5 items"
```

### Using Translation in Server Components

For server components, import and use translations directly:

```text
// In a server component
import { getTranslations } from '@/i18n/server';
 
export default async function ServerComponent() {
  const t = await getTranslations('common');
 
  return <h1>{t('welcome')}</h1>;
}
```

## Best Practices

- Use translation keys: Use structured keys like section.subsection.element instead of full sentences

- Keep translations simple: Avoid complex string interpolation with HTML

- Use formatting utilities: Always use the provided utilities for dates, numbers, and currencies

- Test all languages: Ensure your UI can handle longer text strings in other languages

- Handle loading states: Consider the loading state when translations are not yet loaded

For more detailed information about i18next, refer to the official documentation.

PreviousAuthenticationNextRTL

On This Page

- Internationalization

- i18n Architecture
- Using Translations
- RTL (Right-to-Left) Support
- Adding Translation Content
- Namespaces
- Advanced Usage
- Best Practices

©2026 Keenthemes. All rights reserved.

A Project by Keenthemes

Internationalization - Metronic NextJS
-
-
