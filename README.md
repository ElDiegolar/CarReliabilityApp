# Translations Guide

This document provides instructions for working with translations in the Car Reliability application.

## Overview

The app is set up with internationalization (i18n) support using:
- `next-i18next` - Next.js integration for i18next
- `i18next` - The core internationalization framework
- `react-i18next` - React bindings for i18next

Currently supported languages:
- English (en) - Default
- Spanish (es)
- French (fr)
- German (de)

## File Structure

Translation files are stored in the `public/locales` directory with the following structure:

```
public/
  locales/
    en/
      common.json    # English translations
    es/
      common.json    # Spanish translations
    fr/
      common.json    # French translations
    de/
      common.json    # German translations
```

## Adding New Translations

1. All translations should first be added to the English (`en/common.json`) file
2. Run the translation generation script to update other language files:

```bash
node scripts/generate-translations.js
```

3. This will add any new keys to all language files, keeping existing translations

## Using Translations in Components

To use translations in your components:

```jsx
import { useTranslation } from 'next-i18next';

function MyComponent() {
  const { t } = useTranslation('common');
  
  return (
    <div>
      <h1>{t('some.translation.key')}</h1>
      <p>{t('another.key')}</p>
    </div>
  );
}
```

For translation keys with variables:

```jsx
// In your translation file:
// "welcome": "Welcome, {{name}}!"

<p>{t('welcome', { name: 'John' })}</p>
```

For plural forms:

```jsx
// In your translation file:
// "items": "{{count}} item",
// "items_plural": "{{count}} items"

<p>{t('items', { count: 5 })}</p> // displays "5 items"
```

## Page Configuration

For each page that needs translations, add the following:

```jsx
// Import the serverSideTranslations function
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

// At the bottom of your page component:
export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}

// For pages with getServerSideProps:
export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}
```

## Adding a New Language

1. Update the `next-i18next.config.js` file:

```js
module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es', 'fr', 'de', 'NEW_LANGUAGE_CODE'],
  },
  // ...
};
```

2. Add the new language to the language switcher component:

```jsx
// components/LanguageSwitcher.js
const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'NEW_LANGUAGE_CODE', name: 'New Language Name' },
];
```

3. Update the generate-translations script to include the new language:

```js
// scripts/generate-translations.js
const LOCALES = ['en', 'es', 'fr', 'de', 'NEW_LANGUAGE_CODE'];
```

4. Run the script to generate the translation file:

```bash
node scripts/generate-translations.js
```

5. Translate the newly created file at `public/locales/NEW_LANGUAGE_CODE/common.json`

## Best Practices

1. Use nested keys to organize translations by feature or page
2. Keep translation keys readable and descriptive
3. Always run the translation script after adding new keys
4. Test the application in all supported languages before deployment
5. Use variables for dynamic content instead of concatenating strings