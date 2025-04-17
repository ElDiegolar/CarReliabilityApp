// pages/_app.js
import React from 'react';
import App from 'next/app';
import { appWithTranslation } from 'next-i18next';
import { AuthProvider } from '../contexts/AuthContext';
import nextI18NextConfig from '../next-i18next.config.js';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}

MyApp.getInitialProps = async (appContext) => {
  const appProps = await App.getInitialProps(appContext);
  return { ...appProps };
};

export default appWithTranslation(MyApp, nextI18NextConfig);