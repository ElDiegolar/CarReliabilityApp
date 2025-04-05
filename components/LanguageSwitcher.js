// components/LanguageSwitcher.js
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

const LanguageSwitcher = () => {console.log('LanguageSwitcher rendering');
  const router = useRouter();
  const { t } = useTranslation('common');
  
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'mt', name: 'Maltese' },
  ];

  const changeLanguage = (locale) => {
    // Get the current path
    const { pathname, asPath, query } = router;
    
    // Change the router locale
    router.push({ pathname, query }, asPath, { locale });
  };

  return (
    <div className="language-switcher">
      <select 
        onChange={(e) => changeLanguage(e.target.value)}
        value={router.locale}
      >
        {languages.map((language) => (
          <option key={language.code} value={language.code}>
            {language.name}
          </option>
        ))}
      </select>

      <style jsx>{`
        .language-switcher {
          margin-left: 10px;
        }
        
        select {
          padding: 5px;
          border-radius: 4px;
          border: 1px solid #ddd;
          background: white;
        }
      `}</style>
    </div>
  );
};

export default LanguageSwitcher;