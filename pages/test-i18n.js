// pages/test-i18n.js
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../components/Layout';
import TranslationDebugger from '../components/TranslationsDebugger';

export default function TestI18n() {
  const { t, i18n } = useTranslation('common');
  const router = useRouter();

  const changeLanguage = (locale) => {
    router.push(router.pathname, router.asPath, { locale });
  };

  return (
    <Layout title="Translation Test">
      <div className="container">
        <h1>Translation Test Page</h1>
        
        <div className="language-switcher">
          <h2>Select Language</h2>
          <div className="language-buttons">
            <button onClick={() => changeLanguage('en')} className={router.locale === 'en' ? 'active' : ''}>
              🇬🇧 English
            </button>
            <button onClick={() => changeLanguage('es')} className={router.locale === 'es' ? 'active' : ''}>
              🇪🇸 Español
            </button>
            <button onClick={() => changeLanguage('fr')} className={router.locale === 'fr' ? 'active' : ''}>
              🇫🇷 Français
            </button>
            <button onClick={() => changeLanguage('de')} className={router.locale === 'de' ? 'active' : ''}>
              🇩🇪 Deutsch
            </button>
          </div>
        </div>
        
        <div className="translation-examples">
          <h2>Translation Examples</h2>
          
          <div className="translation-item">
            <div className="label">Test Key:</div>
            <div className="value">{t('test.hello')}</div>
          </div>
          
          <div className="translation-item">
            <div className="label">Hero Title:</div>
            <div className="value">{t('hero.title')}</div>
          </div>
          
          <div className="translation-item">
            <div className="label">Hero Description:</div>
            <div className="value">{t('hero.description')}</div>
          </div>
          
          <div className="translation-item">
            <div className="label">Features Title:</div>
            <div className="value">{t('features.title')}</div>
          </div>
        </div>
        
        <div className="i18n-info">
          <h2>i18n Information</h2>
          
          <div className="info-item">
            <div className="label">Current Locale:</div>
            <div className="value">{router.locale}</div>
          </div>
          
          <div className="info-item">
            <div className="label">Default Locale:</div>
            <div className="value">{i18n.options.defaultLocale}</div>
          </div>
          
          <div className="info-item">
            <div className="label">Available Locales:</div>
            <div className="value">{router.locales?.join(', ')}</div>
          </div>
          
          <div className="info-item">
            <div className="label">i18n Initialized:</div>
            <div className="value">{i18n.isInitialized ? 'Yes' : 'No'}</div>
          </div>
        </div>
        
        <Link href="/" className="home-link">
          Back to Home
        </Link>
      </div>
      
      <TranslationDebugger />
      
      <style jsx>{`
        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem;
        }
        
        h1 {
          margin-bottom: 2rem;
          text-align: center;
        }
        
        h2 {
          margin: 1.5rem 0 1rem;
          color: #0070f3;
        }
        
        .language-switcher {
          margin-bottom: 2rem;
        }
        
        .language-buttons {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }
        
        button {
          padding: 0.8rem 1.2rem;
          background-color: #f5f5f5;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        button:hover {
          background-color: #e5e5e5;
        }
        
        button.active {
          background-color: #0070f3;
          color: white;
          border-color: #0070f3;
        }
        
        .translation-examples, .i18n-info {
          background-color: #f9f9f9;
          border-radius: 8px;
          padding: 1.5rem;
          margin-bottom: 2rem;
        }
        
        .translation-item, .info-item {
          display: flex;
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #eaeaea;
        }
        
        .translation-item:last-child, .info-item:last-child {
          margin-bottom: 0;
          padding-bottom: 0;
          border-bottom: none;
        }
        
        .label {
          flex: 0 0 150px;
          font-weight: bold;
        }
        
        .value {
          flex: 1;
        }
        
        .home-link {
          display: inline-block;
          margin-top: 1rem;
          padding: 0.75rem 1.5rem;
          background-color: #0070f3;
          color: white;
          border-radius: 4px;
          text-decoration: none;
        }
        
        .home-link:hover {
          background-color: #0060df;
        }
      `}</style>
    </Layout>
  );
}

export async function getStaticProps({ locale }) {
  try {
    console.log('Loading translations for locale:', locale);
    const props = await serverSideTranslations(locale || 'en', ['common']);
    console.log('Translation props loaded successfully');
    return {
      props: {
        ...props,
      },
    };
  } catch (error) {
    console.error('Error loading translations:', error);
    return {
      props: {},
    };
  }
}