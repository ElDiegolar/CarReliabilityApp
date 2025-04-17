// components/TranslationDebugger.js
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';

export default function TranslationDebugger() {
  const { t, i18n } = useTranslation('common');
  const router = useRouter();

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const allLocales = Array.isArray(i18n.options.supportedLngs)
    ? i18n.options.supportedLngs
    : i18n.languages;

  return (
    <div className="translation-debugger">
      <h3>Translation Debugger</h3>
      <div className="debug-info">
        <div><strong>Current Locale:</strong> {router.locale}</div>
        <div><strong>Default Locale:</strong> {i18n.options.defaultLocale}</div>
        <div><strong>All Locales:</strong> {allLocales?.join(', ') || 'Not available'}</div>
        <div><strong>i18n Initialized:</strong> {i18n.isInitialized ? 'Yes' : 'No'}</div>
        <div><strong>Translation Test (hero.title):</strong> {t('hero.title')}</div>
        <div><strong>Translation Test with Fallback:</strong> {t('test.key', 'Fallback works if this shows')}</div>
      </div>
      
      <div className="language-switcher">
        <div><strong>Switch Language:</strong></div>
        <div className="language-buttons">
          <button onClick={() => router.push(router.pathname, router.asPath, { locale: 'en' })}>English</button>
          <button onClick={() => router.push(router.pathname, router.asPath, { locale: 'es' })}>Español</button>
          <button onClick={() => router.push(router.pathname, router.asPath, { locale: 'fr' })}>Français</button>
          <button onClick={() => router.push(router.pathname, router.asPath, { locale: 'de' })}>Deutsch</button>
        </div>
      </div>

      <style jsx>{`
        .translation-debugger {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 1rem;
          width: 300px;
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
          z-index: 9999;
          font-family: monospace;
          font-size: 12px;
        }
        
        h3 {
          margin-top: 0;
          border-bottom: 1px solid #eee;
          padding-bottom: 0.5rem;
        }
        
        .debug-info {
          margin-bottom: 1rem;
        }
        
        .debug-info div {
          margin-bottom: 0.25rem;
        }
        
        .language-buttons {
          display: flex;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }
        
        button {
          padding: 0.25rem 0.5rem;
          background: #f5f5f5;
          border: 1px solid #ddd;
          border-radius: 4px;
          cursor: pointer;
        }
        
        button:hover {
          background: #e5e5e5;
        }
      `}</style>
    </div>
  );
}
