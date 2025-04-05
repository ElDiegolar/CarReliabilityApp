module.exports = {
    i18n: {
      defaultLocale: 'en',
      locales: ['en', 'es', 'fr', 'de'],
    },
    localePath: typeof window === 'undefined'
      ? require('path').resolve('./public/locales')
      : '/locales',
  };
  