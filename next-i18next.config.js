// next-i18next.config.js
module.exports = {
    i18n: {
      defaultLocale: 'en',
      locales: ['en', 'es', 'fr', 'de'],
    },
    // Remove these non-standard options
    // fallbackLng: {
    //   default: ['en'],
    // },
    // nonExplicitSupportedLngs: true,
    
    // Add these for debugging in development
    debug: process.env.NODE_ENV === 'development',
    
    // Make sure the namespace is correctly specified
    ns: ['common'],
    defaultNS: 'common',
    
    // Enable file system locales
    localePath: './public/locales',
  };