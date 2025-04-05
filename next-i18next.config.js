// next-i18next.config.js
module.exports = {
    i18n: {
      defaultLocale: 'en',
      locales: ['en', 'es', 'fr', 'de'], // English, Spanish, French, German
    },
    fallbackLng: {
      default: ['en'],
    },
    nonExplicitSupportedLngs: true,
  };